// FIXME move to ext module

export default getVulnSource;

import newDebug from 'debug';
import { statSync } from 'fs';
import * as path from 'path';
import { parsePackageString as moduleToObject } from 'snyk-module';
import resolve from 'snyk-resolve';

const debug = newDebug('snyk:policy');

function getVulnSource(vuln, cwd, live) {
  const from = vuln.from.slice(1).map(function (pkg) {
    return moduleToObject(pkg).name;
  });

  const viaPath = path.resolve(
    cwd || process.cwd(),
    'node_modules',
    from.join('/node_modules/')
  );

  let source = vuln.__filename ? path.dirname(vuln.__filename) : viaPath;

  // try to stat the directory, if it throws, it doesn't exist...
  try {
    statSync(source);
  } catch (e) {
    // ...which means the package is located in a parent path (from an
    // npm dedupe process), so we remove the module name from the path
    // and use the `resolve` package to navigate the node_modules up
    // through parent directories.
    try {
      source = resolve.sync(from.slice(-1).pop(), viaPath);
    } catch (e) {
      if (live) {
        throw e;
      }

      // otherwise this is a dry run so we don't mind that it won't be
      // able to patch - likely a scenario run, so it's fine that the
      // patch target won't be found
    }
    debug('found better source for package: %s', source);
  }

  return source;
}
