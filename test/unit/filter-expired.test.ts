import test from 'tap-only';
import * as policy from '../../lib';

const fixtures = __dirname + '/../fixtures/ignore-expired';
const fixturesNoQuotes = __dirname + '/../fixtures/ignore-expired-no-quotes';
let vulns = require(fixtures + '/vulns.json');

test('expired policies do not strip', function (t) {
  return policy.load(fixtures).then(function (config) {
    const start = vulns.vulnerabilities.length;
    t.ok(start > 0, 'we have vulns to start with');

    // should keep all vulns, because all of the ignores expired
    vulns = config.filter(vulns);
    t.equal(vulns.ok, false, 'post filter, we still have vulns');
    t.equal(vulns.vulnerabilities.length, start, 'all vulns remained');
  });
});

test('expired policies do not strip (no quotes)', function (t) {
  return policy.load(fixturesNoQuotes).then(function (config) {
    const start = vulns.vulnerabilities.length;
    t.ok(start > 0, 'we have vulns to start with');

    // should keep all vulns, because all of the ignores expired
    vulns = config.filter(vulns);
    t.equal(vulns.ok, false, 'post filter, we still have vulns');
    t.equal(vulns.vulnerabilities.length, start, 'all vulns remained');
  });
});
