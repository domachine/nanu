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
              method: 'PUT',
              headers: {
                'Content-Type': 'image/png'
              },
              url: 'host/db/doc/attach',
              uri: 'host/db/doc/attach'
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
    it(
      'should produce a valid HEAD request',
      function (done) {
        var _request;
        _request = function (options, callback) {
          assert.equal(
            JSON.stringify(options),
            JSON.stringify({
              method: 'HEAD',
              uri: 'host/db/doc',
              url: 'host/db/doc'
            })
          );
          callback(
            null,
            {
              statusCode: 200,
              headers: {
                etag: '"123"'
              },
              body: {
              }
            }
          );
        };
        nanu.head(
          'doc',
          {
            _request: _request
          },
          function (error, res, headers) {
            assert.equal(
              JSON.stringify(headers),
              JSON.stringify({
                etag: '123'
              })
            );
            done();
          }
        );
      }
    );
    it(
      'should produce a valid attachment get request',
      function () {
        function _request(options) {
          assert.equal(options.url, 'host/db/doc/attachment');
        }
        nanu.doc('doc').get(
          'attachment',
          {
            _request: _request
          }
        );
      }
    );
  }
);
