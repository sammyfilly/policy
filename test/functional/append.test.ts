import test from 'tap-only';
import * as policy from '../../lib';
import { needsFixing } from '../../lib/parser/v1';

const fixtures = __dirname + '/../fixtures/issues/SC-1106/';
const withDash = fixtures + '/pre-update.snyk';

test('merging new policy data does not corrupt', function (t) {
  return policy.load(withDash).then(function (policy) {
    policy.addIgnore({
      id: 'npm:hawk:20160119',
      path: 'octonode > request > hawk',
      expires: new Date('2016-05-24T13:46:19.066Z'),
      reason: 'none given',
    });

    t.equal(needsFixing(policy.ignore), false, 'no corruption');
    t.equal(
      Object.keys(policy.ignore['npm:hawk:20160119']).length,
      3,
      'has 3 rules'
    );
  });
});
