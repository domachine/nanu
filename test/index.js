var assert = require('assert'),
    nanu = new (require('..').Nanu)('db', 'host');
describe(
  'Doc',
  function () {
    it(
      'should calculate the right url',
      function () {
        assert.equal(
          nanu.doc('doc')._buildUrl('attachment'),
          'host/db/doc/attachment'
        );
      }
    );
    it(
      'should produce a valid request',
      function () {
        var _request;
        _request = function (options) {
          assert.equal(
            JSON.stringify(options),
            JSON.stringify({
              qs: {
                rev: '123',
                batch: 'ok'
              },
              headers: {
                'Content-Type': 'image/png'
              },
              url: 'host/db/doc/attachment',
              uri: 'host/db/doc/attachment'
            })
          );
        };
        nanu.doc('doc').insert(
          'attach',
          {
            rev: '123',
            contentType: 'image/png',
            batch: true,
            _request: _request
          }
        );
      }
    );
  }
);
