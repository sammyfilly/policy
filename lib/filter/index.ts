export default filter;

import newDebug from 'debug';
import ignore from './ignore';
import notes from './notes';
import patch from './patch';

const debug = newDebug('snyk:policy');

// warning: mutates vulns
function filter(vulns, policy, root, matchStrategy = 'packageManager') {
  if (!root) {
    root = process.cwd();
  }

  if (vulns.ok) {
    return vulns;
  }

  const filtered = {
    ignore: [],
    patch: [],
  };

  // strip the ignored modules from the results
  vulns.vulnerabilities = ignore(
    policy.ignore,
    vulns.vulnerabilities,
    filtered.ignore,
    matchStrategy
  );

  vulns.vulnerabilities = patch(
    policy.patch,
    vulns.vulnerabilities,
    root,
    policy.skipVerifyPatch ? true : false,
    filtered.patch
  );

  if (policy.suggest) {
    vulns.vulnerabilities = notes(policy.suggest, vulns.vulnerabilities);
  }

  // if there's no vulns after the ignore process, let's reset the `ok`
  // state and remove the vulns entirely.
  if (vulns.vulnerabilities.length === 0) {
    vulns.ok = true;
    vulns.vulnerabilities = [];
  }

  vulns.filtered = filtered;

  debug('> has threshold? %s', policy.failThreshold);

  if (policy.failThreshold && vulns.ok === false) {
    // check what's left and switch the failure flag if there's anything
    // under our threshold
    const levels = {
      high: 3,
      medium: 2,
      low: 1,
    };
    const level = levels[policy.failThreshold];
    vulns.ok = true;
    vulns.vulnerabilities.some(function (vuln) {
      if (levels[vuln.severity] >= level) {
        vulns.ok = false;
        return true; // breaks
      }
    });
  }

  return vulns;
}
