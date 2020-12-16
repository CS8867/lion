import { expect } from '@open-wc/testing';
import { localize } from '@lion/localize';
import {
  createXSRFRequestTransformer,
  getCookie,
  acceptLanguageRequestTransformer,
} from '../src/transformers.js';

describe('transformers', () => {
  describe('getCookie()', () => {
    it('returns the cookie value', () => {
      expect(getCookie('foo', { cookie: 'foo=bar' })).to.equal('bar');
    });

    it('returns the cookie value when there are multiple cookies', () => {
      expect(getCookie('foo', { cookie: 'foo=bar; bar=foo;lorem=ipsum' })).to.equal('bar');
    });

    it('returns null when the cookie cannot be found', () => {
      expect(getCookie('foo', { cookie: 'bar=foo;lorem=ipsum' })).to.equal(null);
    });

    it('decodes the cookie vaue', () => {
      expect(getCookie('foo', { cookie: `foo=${decodeURIComponent('/foo/ bar "')}` })).to.equal(
        '/foo/ bar "',
      );
    });
  });

  describe('acceptLanguageRequestTransformer()', () => {
    it('adds the locale as accept-language header', () => {
      const request = new Request('/foo/');
      acceptLanguageRequestTransformer(request);
      expect(request.headers.get('accept-language')).to.equal(localize.locale);
    });

    it('does not change an existing accept-language header', () => {
      const request = new Request('/foo/', { headers: { 'accept-language': 'my-accept' } });
      acceptLanguageRequestTransformer(request);
      expect(request.headers.get('accept-language')).to.equal('my-accept');
    });
  });

  describe('createXSRFRequestTransformer()', () => {
    it('adds the xsrf token header to the request', () => {
      const transformer = createXSRFRequestTransformer('XSRF-TOKEN', 'X-XSRF-TOKEN', {
        cookie: 'XSRF-TOKEN=foo',
      });
      const request = new Request('/foo/');
      transformer(request);
      expect(request.headers.get('X-XSRF-TOKEN')).to.equal('foo');
    });

    it('doesnt set anything if the cookie is not there', () => {
      const transformer = createXSRFRequestTransformer('XSRF-TOKEN', 'X-XSRF-TOKEN', {
        cookie: 'XXSRF-TOKEN=foo',
      });
      const request = new Request('/foo/');
      transformer(request);
      expect(request.headers.get('X-XSRF-TOKEN')).to.equal(null);
    });
  });
});
