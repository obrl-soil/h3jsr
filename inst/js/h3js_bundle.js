(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],3:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  get: function () {
    if (!(this instanceof Buffer)) {
      return undefined
    }
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  get: function () {
    if (!(this instanceof Buffer)) {
      return undefined
    }
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (isArrayBuffer(value) || (value && isArrayBuffer(value.buffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (ArrayBuffer.isView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (ArrayBuffer.isView(buf)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isArrayBuffer(string)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffers from another context (i.e. an iframe) do not pass the `instanceof` check
// but they should be treated as valid. See: https://github.com/feross/buffer/issues/166
function isArrayBuffer (obj) {
  return obj instanceof ArrayBuffer ||
    (obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' &&
      typeof obj.byteLength === 'number')
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":2,"ieee754":4}],4:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],5:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":6}],6:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],7:[function(require,module,exports){
(function (global){
global.h3 = require('h3-js'); 

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"h3-js":11}],8:[function(require,module,exports){
/*
 * Copyright 2018 Uber Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Define the C bindings for the h3 library

// Add some aliases to make the function definitions more intelligible
var NUMBER = 'number';
var BOOLEAN = NUMBER;
var H3_LOWER = NUMBER;
var H3_UPPER = NUMBER;
var RESOLUTION = NUMBER;
var POINTER = NUMBER;

// Define the bindings to functions in the C lib. Functions are defined as
// [name, return type, [arg types]]. You must run `npm run build-emscripten`
// before new functions added here will be available.
module.exports = [
    // The size functions are inserted via build/sizes.h
    ['sizeOfH3Index', NUMBER],
    ['sizeOfGeoCoord', NUMBER],
    ['sizeOfGeoBoundary', NUMBER],
    ['sizeOfGeoPolygon', NUMBER],
    ['sizeOfGeofence', NUMBER],
    ['sizeOfLinkedGeoPolygon', NUMBER],
    ['sizeOfCoordIJ', NUMBER],
    // The remaining functions are defined in the core lib in h3Api.h
    ['h3IsValid', BOOLEAN, [H3_LOWER, H3_UPPER]],
    ['geoToH3', H3_LOWER, [NUMBER, NUMBER, RESOLUTION]],
    ['h3ToGeo', null, [H3_LOWER, H3_UPPER, POINTER]],
    ['h3ToGeoBoundary', null, [H3_LOWER, H3_UPPER, POINTER]],
    ['maxKringSize', NUMBER, [NUMBER]],
    ['kRing', null, [H3_LOWER, H3_UPPER, NUMBER, POINTER]],
    ['kRingDistances', null, [H3_LOWER, H3_UPPER, NUMBER, POINTER, POINTER]],
    ['hexRing', null, [H3_LOWER, H3_UPPER, NUMBER, POINTER]],
    ['maxPolyfillSize', NUMBER, [POINTER, RESOLUTION]],
    ['polyfill', null, [POINTER, RESOLUTION, POINTER]],
    ['h3SetToLinkedGeo', null, [POINTER, NUMBER, POINTER]],
    ['destroyLinkedPolygon', null, [POINTER]],
    ['compact', NUMBER, [POINTER, POINTER, NUMBER]],
    ['uncompact', NUMBER, [POINTER, NUMBER, POINTER, NUMBER, RESOLUTION]],
    ['maxUncompactSize', NUMBER, [POINTER, NUMBER, RESOLUTION]],
    ['h3IsPentagon', BOOLEAN, [H3_LOWER, H3_UPPER]],
    ['h3IsResClassIII', BOOLEAN, [H3_LOWER, H3_UPPER]],
    ['h3GetBaseCell', NUMBER, [H3_LOWER, H3_UPPER]],
    ['h3ToParent', H3_LOWER, [H3_LOWER, H3_UPPER, RESOLUTION]],
    ['h3ToChildren', null, [H3_LOWER, H3_UPPER, RESOLUTION, POINTER]],
    ['maxH3ToChildrenSize', NUMBER, [H3_LOWER, H3_UPPER, RESOLUTION]],
    ['h3IndexesAreNeighbors', BOOLEAN, [H3_LOWER, H3_UPPER, H3_LOWER, H3_UPPER]],
    ['getH3UnidirectionalEdge', H3_LOWER, [H3_LOWER, H3_UPPER, H3_LOWER, H3_UPPER]],
    ['getOriginH3IndexFromUnidirectionalEdge', H3_LOWER, [H3_LOWER, H3_UPPER]],
    ['getDestinationH3IndexFromUnidirectionalEdge', H3_LOWER, [H3_LOWER, H3_UPPER]],
    ['h3UnidirectionalEdgeIsValid', BOOLEAN, [H3_LOWER, H3_UPPER]],
    ['getH3IndexesFromUnidirectionalEdge', null, [H3_LOWER, H3_UPPER, POINTER]],
    ['getH3UnidirectionalEdgesFromHexagon', null, [H3_LOWER, H3_UPPER, POINTER]],
    ['getH3UnidirectionalEdgeBoundary', null, [H3_LOWER, H3_UPPER, POINTER]],
    ['h3Distance', NUMBER, [H3_LOWER, H3_UPPER, H3_LOWER, H3_UPPER]],
    ['h3Line', NUMBER, [H3_LOWER, H3_UPPER, H3_LOWER, H3_UPPER, POINTER]],
    ['h3LineSize', NUMBER, [H3_LOWER, H3_UPPER, H3_LOWER, H3_UPPER]],
    ['experimentalH3ToLocalIj', NUMBER, [H3_LOWER, H3_UPPER, H3_LOWER, H3_UPPER, POINTER]],
    ['experimentalLocalIjToH3', NUMBER, [H3_LOWER, H3_UPPER, POINTER, POINTER]],
    ['hexAreaM2', NUMBER, [RESOLUTION]],
    ['hexAreaKm2', NUMBER, [RESOLUTION]],
    ['edgeLengthM', NUMBER, [RESOLUTION]],
    ['edgeLengthKm', NUMBER, [RESOLUTION]],
    ['numHexagons', NUMBER, [RESOLUTION]],
    ['getRes0Indexes', null, [POINTER]],
    ['res0IndexCount', NUMBER]
];

},{}],9:[function(require,module,exports){
/*
 * Copyright 2018 Uber Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @module h3
 */

var C = require('../out/libh3');
var BINDINGS = require('./bindings');

var H3 = {};

// Create the bound functions themselves
BINDINGS.forEach(function bind(def) {
    H3[def[0]] = C.cwrap.apply(C, def);
});

// Alias the hexidecimal base for legibility
var BASE_16 = 16;

// ----------------------------------------------------------------------------
// Byte size imports

var SZ_INT = 4;
var SZ_PTR = 4;
var SZ_DBL = 8;
var SZ_H3INDEX = H3.sizeOfH3Index();
var SZ_GEOCOORD = H3.sizeOfGeoCoord();
var SZ_GEOBOUNDARY = H3.sizeOfGeoBoundary();
var SZ_GEOPOLYGON = H3.sizeOfGeoPolygon();
var SZ_GEOFENCE = H3.sizeOfGeofence();
var SZ_LINKED_GEOPOLYGON = H3.sizeOfLinkedGeoPolygon();
var SZ_COORDIJ = H3.sizeOfCoordIJ();

// ----------------------------------------------------------------------------
// Unit constants
var UNITS = {
    m: 'm',
    km: 'km',
    m2: 'm2',
    km2: 'km2'
};

// ----------------------------------------------------------------------------
// Utilities and helpers

/**
 * Validate a resolution, throwing an error if invalid
 * @private
 * @param  {mixed} res Value to validate
 * @throws {Error}     Error if invalid
 */
function validateRes(res) {
    if (typeof res !== 'number' || res < 0 || res > 15 || Math.floor(res) !== res) {
        throw new Error(("Invalid resolution: " + res));
    }
}

/**
 * Convert an H3 index (64-bit hexidecimal string) into a "split long" - a pair of 32-bit ints
 * @private
 * @param  {H3Index} h3Index  H3 index to check
 * @return {Number[]}         A two-element array with 32 lower bits and 32 upper bits
 */
function h3IndexToSplitLong(h3Index) {
    if (typeof h3Index !== 'string') {
        return [0, 0];
    }
    var upper = parseInt(h3Index.substring(0, h3Index.length - 8), BASE_16);
    var lower = parseInt(h3Index.substring(h3Index.length - 8), BASE_16);
    return [lower, upper];
}

/**
 * Convert a 32-bit int to a hexdecimal string
 * @private
 * @param  {Number} num  Integer to convert
 * @return {H3Index}     Hexidecimal string
 */
function hexFrom32Bit(num) {
    if (num >= 0) {
        return num.toString(BASE_16);
    }

    // Handle negative numbers
    num = num & 0x7fffffff;
    var tempStr = zeroPad(8, num.toString(BASE_16));
    var topNum = (parseInt(tempStr[0], BASE_16) + 8).toString(BASE_16);
    tempStr = topNum + tempStr.substring(1);
    return tempStr;
}

/**
 * Get a H3 index from a split long (pair of 32-bit ints)
 * @private
 * @param  {Number} lower Lower 32 bits
 * @param  {Number} upper Upper 32 bits
 * @return {H3Index}       H3 index
 */
function splitLongToh3Index(lower, upper) {
    return hexFrom32Bit(upper) + zeroPad(8, hexFrom32Bit(lower));
}

/**
 * Zero-pad a string to a given length
 * @private
 * @param  {Number} fullLen Target length
 * @param  {String} numStr  String to zero-pad
 * @return {String}         Zero-padded string
 */
function zeroPad(fullLen, numStr) {
    var numZeroes = fullLen - numStr.length;
    var outStr = '';
    for (var i = 0; i < numZeroes; i++) {
        outStr += '0';
    }
    outStr = outStr + numStr;
    return outStr;
}

/**
 * Populate a C-appropriate Geofence struct from a polygon array
 * @private
 * @param  {Array[]} polygonArray Polygon, as an array of coordinate pairs
 * @param  {Number}  geofence     C pointer to a Geofence struct
 * @param  {Boolean} isGeoJson    Whether coordinates are in [lng, lat] order per GeoJSON spec
 * @return {Number}               C pointer to populated Geofence struct
 */
function polygonArrayToGeofence(polygonArray, geofence, isGeoJson) {
    var numVerts = polygonArray.length;
    var geoCoordArray = C._calloc(numVerts, SZ_GEOCOORD);
    // Support [lng, lat] pairs if GeoJSON is specified
    var latIndex = isGeoJson ? 1 : 0;
    var lngIndex = isGeoJson ? 0 : 1;
    for (var i = 0; i < numVerts * 2; i += 2) {
        C.HEAPF64.set(
            [polygonArray[i / 2][latIndex], polygonArray[i / 2][lngIndex]].map(degsToRads),
            geoCoordArray / SZ_DBL + i
        );
    }
    C.HEAPU32.set([numVerts, geoCoordArray], geofence / SZ_INT);
    return geofence;
}

/**
 * Create a C-appropriate GeoPolygon struct from an array of polygons
 * @private
 * @param  {Array[]} coordinates  Array of polygons, each an array of coordinate pairs
 * @param  {Boolean} isGeoJson    Whether coordinates are in [lng, lat] order per GeoJSON spec
 * @return {Number}               C pointer to populated GeoPolygon struct
 */
function coordinatesToGeoPolygon(coordinates, isGeoJson) {
    // Any loops beyond the first loop are holes
    var numHoles = coordinates.length - 1;
    var geoPolygon = C._calloc(SZ_GEOPOLYGON);
    // Byte positions within the struct
    var geofenceOffset = 0;
    var numHolesOffset = geofenceOffset + SZ_GEOFENCE;
    var holesOffset = numHolesOffset + SZ_INT;
    // geofence is first part of struct
    polygonArrayToGeofence(coordinates[0], geoPolygon + geofenceOffset, isGeoJson);
    var holes;
    if (numHoles > 0) {
        holes = C._calloc(numHoles, SZ_GEOFENCE);
        for (var i = 0; i < numHoles; i++) {
            polygonArrayToGeofence(coordinates[i + 1], holes + SZ_GEOFENCE * i, isGeoJson);
        }
    }
    C.setValue(geoPolygon + numHolesOffset, numHoles, 'i32');
    C.setValue(geoPolygon + holesOffset, holes, 'i32');
    return geoPolygon;
}

/**
 * Free memory allocated for a GeoPolygon struct. It is an error to access the struct
 * after passing it to this method.
 * @private
 * @return {Number} geoPolygon C pointer to populated GeoPolygon struct
 */
function destroyGeoPolygon(geoPolygon) {
    // Byte positions within the struct
    var geofenceOffset = 0;
    var numHolesOffset = geofenceOffset + SZ_GEOFENCE;
    var holesOffset = numHolesOffset + SZ_INT;
    // Free the outer loop
    C._free(C.getValue(geoPolygon + geofenceOffset, 'i8*'));
    // Free the holes, if any
    var numHoles = C.getValue(geoPolygon + numHolesOffset, 'i32');
    for (var i = 0; i < numHoles; i++) {
        C._free(C.getValue(geoPolygon + holesOffset + SZ_GEOFENCE * i, 'i8*'));
    }
    C._free(geoPolygon);
}

/**
 * Read a long value, returning the lower and upper portions as separate 32-bit integers.
 * Because the upper bits are returned via side effect, the argument to this function is
 * intended to be the invocation that caused the side effect, e.g. readLong(H3.getSomeLong())
 * @private
 * @param  {Number} invocation Invoked function returning a long value. The actual return
 *                             value of these functions is a 32-bit integer.
 * @return {Number}            Long value as a [lower, upper] pair
 */
function readLong(invocation) {
    // Upper 32-bits of the long set via side-effect
    var upper = C.getTempRet0();
    return [invocation, upper];
}

/**
 * Read an H3 index from a C return value. As with readLong, the argument to this function
 * is intended to be an invocation, e.g. readH3Index(H3.getSomeAddress()), to help ensure that
 * the temp value storing the upper bits of the long is still set.
 * @private
 * @param  {Number} invocation  Invoked function returning a single H3 index
 * @return {H3Index}            H3 index, or null if index was invalid
 */
function readH3Index(invocation) {
    var ref = readLong(invocation);
    var lower = ref[0];
    var upper = ref[1];
    // The lower bits are allowed to be 0s, but if the upper bits are 0
    // this represents an invalid H3 index
    return upper ? splitLongToh3Index(lower, upper) : null;
}

/**
 * Read an H3 index from a pointer to C memory.
 * @private
 * @param  {Number} cAddress  Pointer to allocated C memory
 * @param {Number} offset     Offset, in number of H3 indexes, in case we're
 *                            reading an array
 * @return {H3Index}          H3 index, or null if index was invalid
 */
function readH3IndexFromPointer(cAddress, offset) {
    if ( offset === void 0 ) offset = 0;

    var lower = C.getValue(cAddress + SZ_INT * offset * 2, 'i32');
    var upper = C.getValue(cAddress + SZ_INT * (offset * 2 + 1), 'i32');
    // The lower bits are allowed to be 0s, but if the upper bits are 0
    // this represents an invalid H3 index
    return upper ? splitLongToh3Index(lower, upper) : null;
}

/**
 * Store an H3 index in C memory.
 * @private
 * @param  {H3Index} h3Index  H3 index to store
 * @param  {Number} cAddress  Pointer to allocated C memory
 * @param {Number} offset     Offset, in number of H3 indexes, in case we're
 *                            writing an array
 */
function storeH3Index(h3Index, cAddress, offset) {
    if ( offset === void 0 ) offset = 0;

    // HEAPU32 is a typed array projection on the index space
    // as unsigned 32-bit integers. This means the index needs
    // to be divided by SZ_INT (4) to access correctly. Also,
    // the H3 index is 64 bits, so we skip by twos as we're writing
    // to 32-bit integers in the proper order.
    C.HEAPU32.set(h3IndexToSplitLong(h3Index), cAddress / SZ_INT + 2 * offset);
}

/**
 * Read an array of 64-bit H3 indexes from C and convert to a JS array of
 * H3 index strings
 * @private
 * @param  {Number} cAddress    Pointer to C ouput array
 * @param  {Number} maxCount    Max number of hexagons in array. Hexagons with
 *                              the value 0 will be skipped, so this isn't
 *                              necessarily the length of the output array.
 * @return {H3Index[]}          Array of H3 indexes
 */
function readArrayOfHexagons(cAddress, maxCount) {
    var out = [];
    for (var i = 0; i < maxCount; i++) {
        var h3Index = readH3IndexFromPointer(cAddress, i);
        if (h3Index !== null) {
            out.push(h3Index);
        }
    }
    return out;
}

/**
 * Store an array of H3 index strings as a C array of 64-bit integers.
 * @private
 * @param  {Number} cAddress    Pointer to C input array
 * @param  {H3Index[]} hexagons H3 indexes to pass to the C lib
 */
function storeArrayOfHexagons(cAddress, hexagons) {
    // Assuming the cAddress points to an already appropriately
    // allocated space
    var count = hexagons.length;
    for (var i = 0; i < count; i++) {
        storeH3Index(hexagons[i], cAddress, i);
    }
}

function readSingleCoord(cAddress) {
    return radsToDegs(C.getValue(cAddress, 'double'));
}

/**
 * Read a GeoCoord from C and return a [lat, lng] pair.
 * @private
 * @param  {Number} cAddress    Pointer to C struct
 * @return {Number[]}           [lat, lng] pair
 */
function readGeoCoord(cAddress) {
    return [readSingleCoord(cAddress), readSingleCoord(cAddress + SZ_DBL)];
}

/**
 * Read a GeoCoord from C and return a GeoJSON-style [lng, lat] pair.
 * @private
 * @param  {Number} cAddress    Pointer to C struct
 * @return {Number[]}           [lng, lat] pair
 */
function readGeoCoordGeoJson(cAddress) {
    return [readSingleCoord(cAddress + SZ_DBL), readSingleCoord(cAddress)];
}

/**
 * Read the GeoBoundary structure into a list of geo coordinate pairs
 * @private
 * @param {Number}  geoBoundary     C pointer to GeoBoundary struct
 * @param {Boolean} geoJsonCoords   Whether to provide GeoJSON coordinate order: [lng, lat]
 * @param {Boolean} closedLoop      Whether to close the loop
 * @return {Array[]}                Array of geo coordinate pairs
 */
function readGeoBoundary(geoBoundary, geoJsonCoords, closedLoop) {
    var numVerts = C.getValue(geoBoundary, 'i32');
    // Note that though numVerts is an int, the coordinate doubles have to be
    // aligned to 8 bytes, hence the 8-byte offset here
    var vertsPos = geoBoundary + SZ_DBL;
    var out = [];
    // Support [lng, lat] pairs if GeoJSON is specified
    var readCoord = geoJsonCoords ? readGeoCoordGeoJson : readGeoCoord;
    for (var i = 0; i < numVerts * 2; i += 2) {
        out.push(readCoord(vertsPos + SZ_DBL * i));
    }
    if (closedLoop) {
        // Close loop if GeoJSON is specified
        out.push(out[0]);
    }
    return out;
}

/**
 * Read the LinkedGeoPolygon structure into a nested array of MultiPolygon coordinates
 * @private
 * @param {Number}  polygon         C pointer to LinkedGeoPolygon struct
 * @param {Boolean} formatAsGeoJson Whether to provide GeoJSON output: [lng, lat], closed loops
 * @return {Array[]}                MultiPolygon-style output.
 */
function readMultiPolygon(polygon, formatAsGeoJson) {
    var output = [];
    var readCoord = formatAsGeoJson ? readGeoCoordGeoJson : readGeoCoord;
    var loops;
    var loop;
    var coords;
    var coord;
    // Loop through the linked structure, building the output
    while (polygon) {
        output.push((loops = []));
        // Follow ->first pointer
        loop = C.getValue(polygon, 'i8*');
        while (loop) {
            loops.push((coords = []));
            // Follow ->first pointer
            coord = C.getValue(loop, 'i8*');
            while (coord) {
                coords.push(readCoord(coord));
                // Follow ->next pointer
                coord = C.getValue(coord + SZ_DBL * 2, 'i8*');
            }
            if (formatAsGeoJson) {
                // Close loop if GeoJSON is requested
                coords.push(coords[0]);
            }
            // Follow ->next pointer
            loop = C.getValue(loop + SZ_PTR * 2, 'i8*');
        }
        // Follow ->next pointer
        polygon = C.getValue(polygon + SZ_PTR * 2, 'i8*');
    }
    return output;
}

/**
 * Read a CoordIJ from C and return an {i, j} pair.
 * @private
 * @param  {Number} cAddress    Pointer to C struct
 * @return {Object}             {i, j} pair
 */
function readCoordIJ(cAddress) {
    return {
        i: C.getValue(cAddress, 'i32'),
        j: C.getValue(cAddress + SZ_INT, 'i32')
    };
}

/**
 * Store an {i, j} pair to a C CoordIJ struct.
 * @private
 * @param  {Number} cAddress    Pointer to C struct
 * @return {Object}             {i, j} pair
 */
function storeCoordIJ(cAddress, ref) {
    var i = ref.i;
    var j = ref.j;

    C.setValue(cAddress, i, 'i32');
    C.setValue(cAddress + SZ_INT, j, 'i32');
}

// ----------------------------------------------------------------------------
// Public API functions: Core

/**
 * Whether a given string represents a valid H3 index
 * @static
 * @param  {H3Index} h3Index  H3 index to check
 * @return {Boolean}          Whether the index is valid
 */
function h3IsValid(h3Index) {
    var ref = h3IndexToSplitLong(h3Index);
    var lower = ref[0];
    var upper = ref[1];
    return Boolean(H3.h3IsValid(lower, upper));
}

/**
 * Whether the given H3 index is a pentagon
 * @static
 * @param  {H3Index} h3Index  H3 index to check
 * @return {Boolean}          isPentagon
 */
function h3IsPentagon(h3Index) {
    var ref = h3IndexToSplitLong(h3Index);
    var lower = ref[0];
    var upper = ref[1];
    return Boolean(H3.h3IsPentagon(lower, upper));
}

/**
 * Whether the given H3 index is in a Class III resolution (rotated versus
 * the icosahedron and subject to shape distortion adding extra points on
 * icosahedron edges, making them not true hexagons).
 * @static
 * @param  {H3Index} h3Index  H3 index to check
 * @return {Boolean}          isResClassIII
 */
function h3IsResClassIII(h3Index) {
    var ref = h3IndexToSplitLong(h3Index);
    var lower = ref[0];
    var upper = ref[1];
    return Boolean(H3.h3IsResClassIII(lower, upper));
}

/**
 * Get the number of the base cell for a given H3 index
 * @static
 * @param  {H3Index} h3Index  H3 index to get the base cell for
 * @return {Number}           Index of the base cell (0-121)
 */
function h3GetBaseCell(h3Index) {
    var ref = h3IndexToSplitLong(h3Index);
    var lower = ref[0];
    var upper = ref[1];
    return H3.h3GetBaseCell(lower, upper);
}

/**
 * Returns the resolution of an H3 index
 * @static
 * @param  {H3Index} h3Index H3 index to get resolution
 * @return {Number}          The number (0-15) resolution, or -1 if invalid
 */
function h3GetResolution(h3Index) {
    if (typeof h3Index !== 'string') {
        return -1;
    }
    return parseInt(h3Index.charAt(1), BASE_16);
}

/**
 * Get the hexagon containing a lat,lon point
 * @static
 * @param  {Number} lat Latitude of point
 * @param  {Number} lng Longtitude of point
 * @param  {Number} res Resolution of hexagons to return
 * @return {H3Index}    H3 index
 */
function geoToH3(lat, lng, res) {
    var latlng = C._malloc(SZ_GEOCOORD);
    // Slightly more efficient way to set the memory
    C.HEAPF64.set([lat, lng].map(degsToRads), latlng / SZ_DBL);
    // Read value as a split long
    var h3Index = readH3Index(H3.geoToH3(latlng, res));
    C._free(latlng);
    return h3Index;
}

/**
 * Get the lat,lon center of a given hexagon
 * @static
 * @param  {H3Index} h3Index  H3 index
 * @return {Number[]}         Point as a [lat, lng] pair
 */
function h3ToGeo(h3Index) {
    var latlng = C._malloc(SZ_GEOCOORD);
    var ref = h3IndexToSplitLong(h3Index);
    var lower = ref[0];
    var upper = ref[1];
    H3.h3ToGeo(lower, upper, latlng);
    var out = readGeoCoord(latlng);
    C._free(latlng);
    return out;
}

/**
 * Get the vertices of a given hexagon (or pentagon), as an array of [lat, lng]
 * points. For pentagons and hexagons on the edge of an icosahedron face, this
 * function may return up to 10 vertices.
 * @static
 * @param  {H3Index} h3Index        H3 index
 * @param {Boolean} formatAsGeoJson Whether to provide GeoJSON output: [lng, lat], closed loops
 * @return {Array[]}                Array of [lat, lng] pairs
 */
function h3ToGeoBoundary(h3Index, formatAsGeoJson) {
    var geoBoundary = C._malloc(SZ_GEOBOUNDARY);
    var ref = h3IndexToSplitLong(h3Index);
    var lower = ref[0];
    var upper = ref[1];
    H3.h3ToGeoBoundary(lower, upper, geoBoundary);
    var out = readGeoBoundary(geoBoundary, formatAsGeoJson, formatAsGeoJson);
    C._free(geoBoundary);
    return out;
}

// ----------------------------------------------------------------------------
// Public API functions: Algorithms

/**
 * Get the parent of the given hexagon at a particular resolution
 * @static
 * @param  {H3Index} h3Index  H3 index to get parent for
 * @param  {Number} res       Resolution of hexagon to return
 * @return {H3Index}          H3 index of parent, or null for invalid input
 */
function h3ToParent(h3Index, res) {
    var ref = h3IndexToSplitLong(h3Index);
    var lower = ref[0];
    var upper = ref[1];
    return readH3Index(H3.h3ToParent(lower, upper, res));
}

/**
 * Get the children/descendents of the given hexagon at a particular resolution
 * @static
 * @param  {H3Index} h3Index  H3 index to get children for
 * @param  {Number} res       Resolution of hexagons to return
 * @return {H3Index[]}        H3 indexes of children, or empty array for invalid input
 */
function h3ToChildren(h3Index, res) {
    var ref = h3IndexToSplitLong(h3Index);
    var lower = ref[0];
    var upper = ref[1];
    var maxCount = H3.maxH3ToChildrenSize(lower, upper, res);
    var hexagons = C._calloc(maxCount, SZ_H3INDEX);
    H3.h3ToChildren(lower, upper, res, hexagons);
    var out = readArrayOfHexagons(hexagons, maxCount);
    C._free(hexagons);
    return out;
}

/**
 * Get all hexagons in a k-ring around a given center. The order of the hexagons is undefined.
 * @static
 * @param  {H3Index} h3Index  H3 index of center hexagon
 * @param  {Number} ringSize  Radius of k-ring
 * @return {H3Index[]}        H3 indexes for all hexagons in ring
 */
function kRing(h3Index, ringSize) {
    var ref = h3IndexToSplitLong(h3Index);
    var lower = ref[0];
    var upper = ref[1];
    var maxCount = H3.maxKringSize(ringSize);
    var hexagons = C._calloc(maxCount, SZ_H3INDEX);
    H3.kRing(lower, upper, ringSize, hexagons);
    var out = readArrayOfHexagons(hexagons, maxCount);
    C._free(hexagons);
    return out;
}

/**
 * Get all hexagons in a k-ring around a given center, in an array of arrays
 * ordered by distance from the origin. The order of the hexagons within each ring is undefined.
 * @static
 * @param  {H3Index} h3Index  H3 index of center hexagon
 * @param  {Number} ringSize  Radius of k-ring
 * @return {H3Index[][]}      Array of arrays with H3 indexes for all hexagons each ring
 */
function kRingDistances(h3Index, ringSize) {
    var ref = h3IndexToSplitLong(h3Index);
    var lower = ref[0];
    var upper = ref[1];
    var maxCount = H3.maxKringSize(ringSize);
    var kRings = C._calloc(maxCount, SZ_H3INDEX);
    var distances = C._calloc(maxCount, SZ_INT);
    H3.kRingDistances(lower, upper, ringSize, kRings, distances);
    // Create an array of empty arrays to hold the output
    var out = [];
    for (var i = 0; i < ringSize + 1; i++) {
        out.push([]);
    }
    // Read the array of hexagons, putting them into the appropriate rings
    for (var i$1 = 0; i$1 < maxCount * 2; i$1 += 2) {
        var hexLower = C.getValue(kRings + SZ_INT * i$1, 'i32');
        var hexUpper = C.getValue(kRings + SZ_INT * (i$1 + 1), 'i32');
        var index = C.getValue(distances + SZ_INT * (i$1 / 2), 'i32');
        if (hexLower !== 0 || hexUpper !== 0) {
            out[index].push(splitLongToh3Index(hexLower, hexUpper));
        }
    }
    C._free(kRings);
    C._free(distances);
    return out;
}

/**
 * Get all hexagons in a hollow hexagonal ring centered at origin with sides of a given length.
 * Unlike kRing, this function will throw an error if there is a pentagon anywhere in the ring.
 * @static
 * @param  {H3Index} h3Index  H3 index of center hexagon
 * @param  {Number} ringSize  Radius of ring
 * @return {H3Index[]}        H3 indexes for all hexagons in ring
 * @throws {Error}            If the algorithm could not calculate the ring
 */
function hexRing(h3Index, ringSize) {
    var maxCount = ringSize === 0 ? 1 : 6 * ringSize;
    var hexagons = C._calloc(maxCount, SZ_H3INDEX);
    var retVal = H3.hexRing.apply(H3, h3IndexToSplitLong(h3Index).concat( [ringSize], [hexagons] ));
    if (retVal !== 0) {
        C._free(hexagons);
        throw new Error('Failed to get hexRing (encountered a pentagon?)');
    }
    var out = readArrayOfHexagons(hexagons, maxCount);
    C._free(hexagons);
    return out;
}

/**
 * Get all hexagons with centers contained in a given polygon. The polygon
 * is specified with GeoJson semantics as an array of loops. Each loop is
 * an array of [lat, lng] pairs (or [lng, lat] if isGeoJson is specified).
 * The first loop is the perimeter of the polygon, and subsequent loops are
 * expected to be holes.
 * @static
 * @param  {Array[]}  coordinates   Array of loops, or a single loop
 * @param  {Number} res             Resolution of hexagons to return
 * @param  {Boolean} isGeoJson      Whether to expect GeoJson-style [lng, lat]
 *                                  pairs instead of [lat, lng]
 * @return {H3Index[]}              H3 indexes for all hexagons in polygon
 */
function polyfill(coordinates, res, isGeoJson) {
    validateRes(res);
    isGeoJson = Boolean(isGeoJson);
    // Guard against empty input
    if (coordinates.length === 0 || coordinates[0].length === 0) {
        return [];
    }
    // Wrap to expected format if a single loop is provided
    if (typeof coordinates[0][0] === 'number') {
        coordinates = [coordinates];
    }
    var geoPolygon = coordinatesToGeoPolygon(coordinates, isGeoJson);
    var arrayLen = H3.maxPolyfillSize(geoPolygon, res);
    var hexagons = C._calloc(arrayLen, SZ_H3INDEX);
    H3.polyfill(geoPolygon, res, hexagons);
    var out = readArrayOfHexagons(hexagons, arrayLen);
    C._free(hexagons);
    destroyGeoPolygon(geoPolygon);
    return out;
}

/**
 * Get the outlines of a set of H3 hexagons, returned in GeoJSON MultiPolygon
 * format (an array of polygons, each with an array of loops, each an array of
 * coordinates). Coordinates are returned as [lat, lng] pairs unless GeoJSON
 * is requested.
 * @static
 * @param {H3Index[]} h3Indexes       H3 indexes to get outlines for
 * @param {Boolean}   formatAsGeoJson Whether to provide GeoJSON output:
 *                                    [lng, lat], closed loops
 * @return {Array[]}                  MultiPolygon-style output.
 */
function h3SetToMultiPolygon(h3Indexes, formatAsGeoJson) {
    // Early exit on empty input
    if (!h3Indexes || !h3Indexes.length) {
        return [];
    }
    // Set up input set
    var indexCount = h3Indexes.length;
    var set = C._calloc(indexCount, SZ_H3INDEX);
    storeArrayOfHexagons(set, h3Indexes);
    // Allocate memory for output linked polygon
    var polygon = C._calloc(SZ_LINKED_GEOPOLYGON);
    // Store a reference to the first polygon - that's the one we need for
    // memory deallocation
    var originalPolygon = polygon;
    H3.h3SetToLinkedGeo(set, indexCount, polygon);
    var multiPolygon = readMultiPolygon(polygon, formatAsGeoJson);
    // Clean up
    H3.destroyLinkedPolygon(originalPolygon);
    C._free(originalPolygon);
    C._free(set);
    return multiPolygon;
}

/**
 * Compact a set of hexagons of the same resolution into a set of hexagons across
 * multiple levels that represents the same area.
 * @static
 * @param  {H3Index[]} h3Set H3 indexes to compact
 * @return {H3Index[]}       Compacted H3 indexes
 * @throws {Error}           If the input is invalid (e.g. duplicate hexagons)
 */
function compact(h3Set) {
    if (!h3Set || !h3Set.length) {
        return [];
    }
    // Set up input set
    var count = h3Set.length;
    var set = C._calloc(count, SZ_H3INDEX);
    storeArrayOfHexagons(set, h3Set);
    // Allocate memory for compacted hexagons, worst-case is no compaction
    var compactedSet = C._calloc(count, SZ_H3INDEX);
    var retVal = H3.compact(set, compactedSet, count);
    if (retVal !== 0) {
        C._free(set);
        C._free(compactedSet);
        throw new Error('Failed to compact, malformed input data (duplicate hexagons?)');
    }
    var out = readArrayOfHexagons(compactedSet, count);
    C._free(set);
    C._free(compactedSet);
    return out;
}

/**
 * Uncompact a compacted set of hexagons to hexagons of the same resolution
 * @static
 * @param  {H3Index[]} compactedSet H3 indexes to uncompact
 * @param  {Number}    res          The resolution to uncompact to
 * @return {H3Index[]}              The uncompacted H3 indexes
 * @throws {Error}                  If the input is invalid (e.g. invalid resolution)
 */
function uncompact(compactedSet, res) {
    validateRes(res);
    if (!compactedSet || !compactedSet.length) {
        return [];
    }
    // Set up input set
    var count = compactedSet.length;
    var set = C._calloc(count, SZ_H3INDEX);
    storeArrayOfHexagons(set, compactedSet);
    // Estimate how many hexagons we need (always overestimates if in error)
    var maxUncompactedNum = H3.maxUncompactSize(set, count, res);
    // Allocate memory for uncompacted hexagons
    var uncompactedSet = C._calloc(maxUncompactedNum, SZ_H3INDEX);
    var retVal = H3.uncompact(set, count, uncompactedSet, maxUncompactedNum, res);
    if (retVal !== 0) {
        C._free(set);
        C._free(uncompactedSet);
        throw new Error('Failed to uncompact (bad resolution?)');
    }
    var out = readArrayOfHexagons(uncompactedSet, maxUncompactedNum);
    C._free(set);
    C._free(uncompactedSet);
    return out;
}

// ----------------------------------------------------------------------------
// Public API functions: Unidirectional edges

/**
 * Whether two H3 indexes are neighbors (share an edge)
 * @static
 * @param  {H3Index} origin      Origin hexagon index
 * @param  {H3Index} destination Destination hexagon index
 * @return {Boolean}             Whether the hexagons share an edge
 */
function h3IndexesAreNeighbors(origin, destination) {
    var ref = h3IndexToSplitLong(origin);
    var oLower = ref[0];
    var oUpper = ref[1];
    var ref$1 = h3IndexToSplitLong(destination);
    var dLower = ref$1[0];
    var dUpper = ref$1[1];
    return Boolean(H3.h3IndexesAreNeighbors(oLower, oUpper, dLower, dUpper));
}

/**
 * Get an H3 index representing a unidirectional edge for a given origin and destination
 * @static
 * @param  {H3Index} origin      Origin hexagon index
 * @param  {H3Index} destination Destination hexagon index
 * @return {H3Index}             H3 index of the edge, or null if no edge is shared
 */
function getH3UnidirectionalEdge(origin, destination) {
    var ref = h3IndexToSplitLong(origin);
    var oLower = ref[0];
    var oUpper = ref[1];
    var ref$1 = h3IndexToSplitLong(destination);
    var dLower = ref$1[0];
    var dUpper = ref$1[1];
    return readH3Index(H3.getH3UnidirectionalEdge(oLower, oUpper, dLower, dUpper));
}

/**
 * Get the origin hexagon from an H3 index representing a unidirectional edge
 * @static
 * @param  {H3Index} edgeIndex H3 index of the edge
 * @return {H3Index}           H3 index of the edge origin
 */
function getOriginH3IndexFromUnidirectionalEdge(edgeIndex) {
    var ref = h3IndexToSplitLong(edgeIndex);
    var lower = ref[0];
    var upper = ref[1];
    return readH3Index(H3.getOriginH3IndexFromUnidirectionalEdge(lower, upper));
}

/**
 * Get the destination hexagon from an H3 index representing a unidirectional edge
 * @static
 * @param  {H3Index} edgeIndex H3 index of the edge
 * @return {H3Index}           H3 index of the edge destination
 */
function getDestinationH3IndexFromUnidirectionalEdge(edgeIndex) {
    var ref = h3IndexToSplitLong(edgeIndex);
    var lower = ref[0];
    var upper = ref[1];
    return readH3Index(H3.getDestinationH3IndexFromUnidirectionalEdge(lower, upper));
}

/**
 * Whether the input is a valid unidirectional edge
 * @static
 * @param  {H3Index} edgeIndex H3 index of the edge
 * @return {Boolean}           Whether the index is valid
 */
function h3UnidirectionalEdgeIsValid(edgeIndex) {
    var ref = h3IndexToSplitLong(edgeIndex);
    var lower = ref[0];
    var upper = ref[1];
    return Boolean(H3.h3UnidirectionalEdgeIsValid(lower, upper));
}

/**
 * Get the [origin, destination] pair represented by a unidirectional edge
 * @static
 * @param  {H3Index} edgeIndex H3 index of the edge
 * @return {H3Index[]}         [origin, destination] pair as H3 indexes
 */
function getH3IndexesFromUnidirectionalEdge(edgeIndex) {
    var ref = h3IndexToSplitLong(edgeIndex);
    var lower = ref[0];
    var upper = ref[1];
    var count = 2;
    var hexagons = C._calloc(count, SZ_H3INDEX);
    H3.getH3IndexesFromUnidirectionalEdge(lower, upper, hexagons);
    var out = readArrayOfHexagons(hexagons, count);
    C._free(hexagons);
    return out;
}

/**
 * Get all of the unidirectional edges with the given H3 index as the origin (i.e. an edge to
 * every neighbor)
 * @static
 * @param  {H3Index} h3Index   H3 index of the origin hexagon
 * @return {H3Index[]}         List of unidirectional edges
 */
function getH3UnidirectionalEdgesFromHexagon(h3Index) {
    var ref = h3IndexToSplitLong(h3Index);
    var lower = ref[0];
    var upper = ref[1];
    var count = 6;
    var edges = C._calloc(count, SZ_H3INDEX);
    H3.getH3UnidirectionalEdgesFromHexagon(lower, upper, edges);
    var out = readArrayOfHexagons(edges, count);
    C._free(edges);
    return out;
}

/**
 * Get the vertices of a given edge as an array of [lat, lng] points. Note that for edges that
 * cross the edge of an icosahedron face, this may return 3 coordinates.
 * @static
 * @param  {H3Index} edgeIndex      H3 index of the edge
 * @param {Boolean} formatAsGeoJson Whether to provide GeoJSON output: [lng, lat]
 * @return {Array[]}                Array of geo coordinate pairs
 */
function getH3UnidirectionalEdgeBoundary(edgeIndex, formatAsGeoJson) {
    var geoBoundary = C._malloc(SZ_GEOBOUNDARY);
    var ref = h3IndexToSplitLong(edgeIndex);
    var lower = ref[0];
    var upper = ref[1];
    H3.getH3UnidirectionalEdgeBoundary(lower, upper, geoBoundary);
    var out = readGeoBoundary(geoBoundary, formatAsGeoJson);
    C._free(geoBoundary);
    return out;
}

/**
 * Get the grid distance between two hex indexes. This function may fail
 * to find the distance between two indexes if they are very far apart or
 * on opposite sides of a pentagon.
 * @static
 * @param  {H3Index} origin      Origin hexagon index
 * @param  {H3Index} destination Destination hexagon index
 * @return {Number}              Distance between hexagons, or a negative
 *                               number if the distance could not be computed
 */
function h3Distance(origin, destination) {
    var ref = h3IndexToSplitLong(origin);
    var oLower = ref[0];
    var oUpper = ref[1];
    var ref$1 = h3IndexToSplitLong(destination);
    var dLower = ref$1[0];
    var dUpper = ref$1[1];
    return H3.h3Distance(oLower, oUpper, dLower, dUpper);
}

/**
 * Given two H3 indexes, return the line of indexes between them (inclusive).
 *
 * This function may fail to find the line between two indexes, for
 * example if they are very far apart. It may also fail when finding
 * distances for indexes on opposite sides of a pentagon.
 *
 * Notes:
 *
 *  - The specific output of this function should not be considered stable
 *    across library versions. The only guarantees the library provides are
 *    that the line length will be `h3Distance(start, end) + 1` and that
 *    every index in the line will be a neighbor of the preceding index.
 *  - Lines are drawn in grid space, and may not correspond exactly to either
 *    Cartesian lines or great arcs.
 *
 * @static
 * @param  {H3Index} origin      Origin hexagon index
 * @param  {H3Index} destination Destination hexagon index
 * @return {H3Index[]}           H3 indexes connecting origin and destination
 * @throws {Error}               If the line cannot be calculated
 */
function h3Line(origin, destination) {
    var ref = h3IndexToSplitLong(origin);
    var oLower = ref[0];
    var oUpper = ref[1];
    var ref$1 = h3IndexToSplitLong(destination);
    var dLower = ref$1[0];
    var dUpper = ref$1[1];
    var count = H3.h3LineSize(oLower, oUpper, dLower, dUpper);
    if (count < 0) {
        // We can't get the specific error code here - may be any of
        // the errors possible in experimentalH3ToLocalIj
        throw new Error('Line cannot be calculated');
    }
    var hexagons = C._calloc(count, SZ_H3INDEX);
    H3.h3Line(oLower, oUpper, dLower, dUpper, hexagons);
    var out = readArrayOfHexagons(hexagons, count);
    C._free(hexagons);
    return out;
}

/**
 * Produces IJ coordinates for an H3 index anchored by an origin.
 *
 * - The coordinate space used by this function may have deleted
 * regions or warping due to pentagonal distortion.
 * - Coordinates are only comparable if they come from the same
 * origin index.
 * - Failure may occur if the index is too far away from the origin
 * or if the index is on the other side of a pentagon.
 * - This function is experimental, and its output is not guaranteed
 * to be compatible across different versions of H3.
 * @static
 * @param  {H3Index} origin      Origin H3 index
 * @param  {H3Index} destination H3 index for which to find relative coordinates
 * @return {Object}              Coordinates as an `{i, j}` pair
 * @throws {Error}               If the IJ coordinates cannot be calculated
 */
function experimentalH3ToLocalIj(origin, destination) {
    var ij = C._malloc(SZ_COORDIJ);
    var retVal = H3.experimentalH3ToLocalIj.apply(
        H3, h3IndexToSplitLong(origin).concat( h3IndexToSplitLong(destination),
        [ij] )
    );
    var coords = readCoordIJ(ij);
    C._free(ij);
    // Return the pair, or throw if an error code was returned.
    // Switch statement and error codes cribbed from h3-java's implementation.
    switch (retVal) {
        case 0:
            return coords;
        case 1:
            throw new Error('Incompatible origin and index.');
        case 2:
        default:
            throw new Error(
                'Local IJ coordinates undefined for this origin and index pair. ' +
                    'The index may be too far from the origin.'
            );
        case 3:
        case 4:
        case 5:
            throw new Error('Encountered possible pentagon distortion');
    }
}

/**
 * Produces an H3 index for IJ coordinates anchored by an origin.
 *
 * - The coordinate space used by this function may have deleted
 * regions or warping due to pentagonal distortion.
 * - Coordinates are only comparable if they come from the same
 * origin index.
 * - Failure may occur if the index is too far away from the origin
 * or if the index is on the other side of a pentagon.
 * - This function is experimental, and its output is not guaranteed
 * to be compatible across different versions of H3.
 * @static
 * @param  {H3Index} origin     Origin H3 index
 * @param  {Object} coords      Coordinates as an `{i, j}` pair
 * @return {H3Index}            H3 index at the relative coordinates
 * @throws {Error}              If the H3 index cannot be calculated
 */
function experimentalLocalIjToH3(origin, coords) {
    // Validate input coords
    if (!coords || typeof coords.i !== 'number' || typeof coords.j !== 'number') {
        throw new Error('Coordinates must be provided as an {i, j} object');
    }
    // Allocate memory for the CoordIJ struct and an H3 index to hold the return value
    var ij = C._malloc(SZ_COORDIJ);
    var out = C._malloc(SZ_H3INDEX);
    storeCoordIJ(ij, coords);
    var retVal = H3.experimentalLocalIjToH3.apply(H3, h3IndexToSplitLong(origin).concat( [ij], [out] ));
    var h3Index = readH3IndexFromPointer(out);
    C._free(ij);
    C._free(out);
    if (retVal !== 0) {
        throw new Error(
            'Index not defined for this origin and IJ coordinates pair. ' +
                'IJ coordinates may be too far from origin, or ' +
                'a pentagon distortion was encountered.'
        );
    }
    return h3Index;
}

// ----------------------------------------------------------------------------
// Public informational utilities

/**
 * Average hexagon area at a given resolution
 * @static
 * @param  {Number} res  Hexagon resolution
 * @param  {String} unit Area unit (either UNITS.m2 or UNITS.km2)
 * @return {Number}      Average area
 * @throws {Error}       If the unit is invalid
 */
function hexArea(res, unit) {
    validateRes(res);
    switch (unit) {
        case UNITS.m2:
            return H3.hexAreaM2(res);
        case UNITS.km2:
            return H3.hexAreaKm2(res);
        default:
            throw new Error(("Unknown unit: " + unit));
    }
}

/**
 * Average hexagon edge length at a given resolution
 * @static
 * @param  {Number} res  Hexagon resolution
 * @param  {String} unit Area unit (either UNITS.m or UNITS.km)
 * @return {Number}      Average edge length
 * @throws {Error}       If the unit is invalid
 */
function edgeLength(res, unit) {
    validateRes(res);
    switch (unit) {
        case UNITS.m:
            return H3.edgeLengthM(res);
        case UNITS.km:
            return H3.edgeLengthKm(res);
        default:
            throw new Error(("Unknown unit: " + unit));
    }
}

/**
 * The total count of hexagons in the world at a given resolution. Note that above
 * resolution 8 the exact count cannot be represented in a JavaScript 32-bit number,
 * so consumers should use caution when applying further operations to the output.
 * @static
 * @param  {Number} res  Hexagon resolution
 * @return {Number}      Count
 */
function numHexagons(res) {
    validateRes(res);
    // Get number as a long value
    var ref = readLong(H3.numHexagons(res));
    var lower = ref[0];
    var upper = ref[1];
    // If we're using <= 32 bits we can use normal JS numbers
    if (!upper) {
        return lower;
    }
    // Above 32 bit, make a JS number that's correct in order of magnitude
    return upper * Math.pow(2, 32) + lower;
}

/**
 * Get all H3 indexes at resolution 0. As every index at every resolution > 0 is
 * the descendant of a res 0 index, this can be used with h3ToChildren to iterate
 * over H3 indexes at any resolution.
 * @static
 * @return {H3Index[]}  All H3 indexes at res 0
 */
function getRes0Indexes() {
    var count = H3.res0IndexCount();
    var hexagons = C._malloc(SZ_H3INDEX * count);
    H3.getRes0Indexes(hexagons);
    var out = readArrayOfHexagons(hexagons, count);
    C._free(hexagons);
    return out;
}

/**
 * Convert degrees to radians
 * @static
 * @param  {Number} deg Value in degrees
 * @return {Number}     Value in radians
 */
function degsToRads(deg) {
    return (deg * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 * @static
 * @param  {Number} rad Value in radians
 * @return {Number}     Value in degrees
 */
function radsToDegs(rad) {
    return (rad * 180) / Math.PI;
}

// ----------------------------------------------------------------------------
// Export

module.exports = {
    h3IsValid: h3IsValid,
    h3IsPentagon: h3IsPentagon,
    h3IsResClassIII: h3IsResClassIII,
    h3GetBaseCell: h3GetBaseCell,
    h3GetResolution: h3GetResolution,
    geoToH3: geoToH3,
    h3ToGeo: h3ToGeo,
    h3ToGeoBoundary: h3ToGeoBoundary,
    h3ToParent: h3ToParent,
    h3ToChildren: h3ToChildren,
    kRing: kRing,
    kRingDistances: kRingDistances,
    hexRing: hexRing,
    polyfill: polyfill,
    h3SetToMultiPolygon: h3SetToMultiPolygon,
    compact: compact,
    uncompact: uncompact,
    h3IndexesAreNeighbors: h3IndexesAreNeighbors,
    getH3UnidirectionalEdge: getH3UnidirectionalEdge,
    getOriginH3IndexFromUnidirectionalEdge: getOriginH3IndexFromUnidirectionalEdge,
    getDestinationH3IndexFromUnidirectionalEdge: getDestinationH3IndexFromUnidirectionalEdge,
    h3UnidirectionalEdgeIsValid: h3UnidirectionalEdgeIsValid,
    getH3IndexesFromUnidirectionalEdge: getH3IndexesFromUnidirectionalEdge,
    getH3UnidirectionalEdgesFromHexagon: getH3UnidirectionalEdgesFromHexagon,
    getH3UnidirectionalEdgeBoundary: getH3UnidirectionalEdgeBoundary,
    h3Distance: h3Distance,
    h3Line: h3Line,
    experimentalH3ToLocalIj: experimentalH3ToLocalIj,
    experimentalLocalIjToH3: experimentalLocalIjToH3,
    hexArea: hexArea,
    edgeLength: edgeLength,
    numHexagons: numHexagons,
    getRes0Indexes: getRes0Indexes,
    degsToRads: degsToRads,
    radsToDegs: radsToDegs,
    UNITS: UNITS
};

},{"../out/libh3":10,"./bindings":8}],10:[function(require,module,exports){
(function (process,Buffer,__dirname){

var libh3 = (function() {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  return (
function(libh3) {
  libh3 = libh3 || {};

var Module=typeof libh3!=="undefined"?libh3:{};var moduleOverrides={};var key;for(key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}Module["arguments"]=[];Module["thisProgram"]="./this.program";Module["quit"]=(function(status,toThrow){throw toThrow});Module["preRun"]=[];Module["postRun"]=[];var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=false;var ENVIRONMENT_IS_NODE=false;var ENVIRONMENT_IS_SHELL=false;ENVIRONMENT_IS_WEB=typeof window==="object";ENVIRONMENT_IS_WORKER=typeof importScripts==="function";ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof require==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}else{return scriptDirectory+path}}if(ENVIRONMENT_IS_NODE){scriptDirectory=__dirname+"/";var nodeFS;var nodePath;Module["read"]=function shell_read(filename,binary){var ret;ret=tryParseAsDataURI(filename);if(!ret){if(!nodeFS)nodeFS=require("fs");if(!nodePath)nodePath=require("path");filename=nodePath["normalize"](filename);ret=nodeFS["readFileSync"](filename)}return binary?ret:ret.toString()};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}Module["arguments"]=process["argv"].slice(2);process["on"]("unhandledRejection",abort);Module["quit"]=(function(status){process["exit"](status)});Module["inspect"]=(function(){return"[Emscripten Module object]"})}else if(ENVIRONMENT_IS_SHELL){if(typeof read!="undefined"){Module["read"]=function shell_read(f){var data=tryParseAsDataURI(f);if(data){return intArrayToString(data)}return read(f)}}Module["readBinary"]=function readBinary(f){var data;data=tryParseAsDataURI(f);if(data){return data}if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof quit==="function"){Module["quit"]=(function(status){quit(status)})}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WORKER){scriptDirectory=self.location.href}else if(document.currentScript){scriptDirectory=document.currentScript.src}if(_scriptDir){scriptDirectory=_scriptDir}if(scriptDirectory.indexOf("blob:")!==0){scriptDirectory=scriptDirectory.substr(0,scriptDirectory.lastIndexOf("/")+1)}else{scriptDirectory=""}Module["read"]=function shell_read(url){try{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText}catch(err){var data=tryParseAsDataURI(url);if(data){return intArrayToString(data)}throw err}};if(ENVIRONMENT_IS_WORKER){Module["readBinary"]=function readBinary(url){try{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}catch(err){var data=tryParseAsDataURI(url);if(data){return data}throw err}}}Module["readAsync"]=function readAsync(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}var data=tryParseAsDataURI(url);if(data){onload(data.buffer);return}onerror()};xhr.onerror=onerror;xhr.send(null)};Module["setWindowTitle"]=(function(title){document.title=title})}else{}var out=Module["print"]||(typeof console!=="undefined"?console.log.bind(console):typeof print!=="undefined"?print:null);var err=Module["printErr"]||(typeof printErr!=="undefined"?printErr:typeof console!=="undefined"&&console.warn.bind(console)||out);for(key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}moduleOverrides=undefined;var STACK_ALIGN=16;function dynamicAlloc(size){var ret=HEAP32[DYNAMICTOP_PTR>>2];var end=ret+size+15&-16;if(end<=_emscripten_get_heap_size()){HEAP32[DYNAMICTOP_PTR>>2]=end}else{var success=_emscripten_resize_heap(end);if(!success)return 0}return ret}function getNativeTypeSize(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return 4}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0,"getNativeTypeSize invalid bits "+bits+", type "+type);return bits/8}else{return 0}}}}function warnOnce(text){if(!warnOnce.shown)warnOnce.shown={};if(!warnOnce.shown[text]){warnOnce.shown[text]=1;err(text)}}var jsCallStartIndex=1;var functionPointers=new Array(0);var funcWrappers={};function dynCall(sig,ptr,args){if(args&&args.length){return Module["dynCall_"+sig].apply(null,[ptr].concat(args))}else{return Module["dynCall_"+sig].call(null,ptr)}}var tempRet0=0;var setTempRet0=(function(value){tempRet0=value});var getTempRet0=(function(){return tempRet0});var GLOBAL_BASE=8;var ABORT=false;var EXITSTATUS=0;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}function getCFunc(ident){var func=Module["_"+ident];assert(func,"Cannot call unknown function "+ident+", make sure it is exported");return func}var JSfuncs={"stackSave":(function(){stackSave()}),"stackRestore":(function(){stackRestore()}),"arrayToC":(function(arr){var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}),"stringToC":(function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){var len=(str.length<<2)+1;ret=stackAlloc(len);stringToUTF8(str,ret,len)}return ret})};var toC={"string":JSfuncs["stringToC"],"array":JSfuncs["arrayToC"]};function ccall(ident,returnType,argTypes,args,opts){function convertReturnValue(ret){if(returnType==="string")return Pointer_stringify(ret);if(returnType==="boolean")return Boolean(ret);return ret}var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);ret=convertReturnValue(ret);if(stack!==0)stackRestore(stack);return ret}function cwrap(ident,returnType,argTypes,opts){argTypes=argTypes||[];var numericArgs=argTypes.every((function(type){return type==="number"}));var numericRet=returnType!=="string";if(numericRet&&numericArgs&&!opts){return getCFunc(ident)}return(function(){return ccall(ident,returnType,argTypes,arguments,opts)})}function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=+1?tempDouble>+0?(Math_min(+Math_floor(tempDouble/+4294967296),+4294967295)|0)>>>0:~~+Math_ceil((tempDouble- +(~~tempDouble>>>0))/+4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}function getValue(ptr,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":return HEAP8[ptr>>0];case"i8":return HEAP8[ptr>>0];case"i16":return HEAP16[ptr>>1];case"i32":return HEAP32[ptr>>2];case"i64":return HEAP32[ptr>>2];case"float":return HEAPF32[ptr>>2];case"double":return HEAPF64[ptr>>3];default:abort("invalid type for getValue: "+type)}return null}var ALLOC_NONE=3;function Pointer_stringify(ptr,length){if(length===0||!ptr)return"";var hasUtf=0;var t;var i=0;while(1){t=HEAPU8[ptr+i>>0];hasUtf|=t;if(t==0&&!length)break;i++;if(length&&i==length)break}if(!length)length=i;var ret="";if(hasUtf<128){var MAX_CHUNK=1024;var curr;while(length>0){curr=String.fromCharCode.apply(String,HEAPU8.subarray(ptr,ptr+Math.min(length,MAX_CHUNK)));ret=ret?ret+curr:curr;ptr+=MAX_CHUNK;length-=MAX_CHUNK}return ret}return UTF8ToString(ptr)}var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(u8Array,idx){var endPtr=idx;while(u8Array[endPtr])++endPtr;if(endPtr-idx>16&&u8Array.subarray&&UTF8Decoder){return UTF8Decoder.decode(u8Array.subarray(idx,endPtr))}else{var str="";while(1){var u0=u8Array[idx++];if(!u0)return str;if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u0=(u0&7)<<18|u1<<12|u2<<6|u8Array[idx++]&63}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}}function UTF8ToString(ptr){return UTF8ArrayToString(HEAPU8,ptr)}function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023}if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}outU8Array[outIdx]=0;return outIdx-startIdx}function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){++len}else if(u<=2047){len+=2}else if(u<=65535){len+=3}else if(u<=2097151){len+=4}else if(u<=67108863){len+=5}else{len+=6}}return len}var UTF16Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined;function demangle(func){return func}function demangleAll(text){var regex=/__Z[\w\d_]+/g;return text.replace(regex,(function(x){var y=demangle(x);return x===y?x:y+" ["+x+"]"}))}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}if(!err.stack){return"(no stack trace available)"}}return err.stack.toString()}function alignUp(x,multiple){if(x%multiple>0){x+=multiple-x%multiple}return x}var buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBuffer(buf){Module["buffer"]=buffer=buf}function updateGlobalBufferViews(){Module["HEAP8"]=HEAP8=new Int8Array(buffer);Module["HEAP16"]=HEAP16=new Int16Array(buffer);Module["HEAP32"]=HEAP32=new Int32Array(buffer);Module["HEAPU8"]=HEAPU8=new Uint8Array(buffer);Module["HEAPU16"]=HEAPU16=new Uint16Array(buffer);Module["HEAPU32"]=HEAPU32=new Uint32Array(buffer);Module["HEAPF32"]=HEAPF32=new Float32Array(buffer);Module["HEAPF64"]=HEAPF64=new Float64Array(buffer)}var STATIC_BASE=8,STACK_BASE=23808,DYNAMIC_BASE=5266688,DYNAMICTOP_PTR=23552;function abortOnCannotGrowMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+TOTAL_MEMORY+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or (4) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")}if(!Module["reallocBuffer"])Module["reallocBuffer"]=(function(size){var ret;try{var oldHEAP8=HEAP8;ret=new ArrayBuffer(size);var temp=new Int8Array(ret);temp.set(oldHEAP8)}catch(e){return false}var success=_emscripten_replace_memory(ret);if(!success)return false;return ret});var byteLength;try{byteLength=Function.prototype.call.bind(Object.getOwnPropertyDescriptor(ArrayBuffer.prototype,"byteLength").get);byteLength(new ArrayBuffer(4))}catch(e){byteLength=(function(buffer){return buffer.byteLength})}var TOTAL_STACK=5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||33554432;if(TOTAL_MEMORY<TOTAL_STACK)err("TOTAL_MEMORY should be larger than TOTAL_STACK, was "+TOTAL_MEMORY+"! (TOTAL_STACK="+TOTAL_STACK+")");if(Module["buffer"]){buffer=Module["buffer"]}else{{buffer=new ArrayBuffer(TOTAL_MEMORY)}Module["buffer"]=buffer}updateGlobalBufferViews();HEAP32[DYNAMICTOP_PTR>>2]=DYNAMIC_BASE;function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Module["dynCall_v"](func)}else{Module["dynCall_vi"](func,callback.arg)}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}function writeArrayToMemory(array,buffer){HEAP8.set(array,buffer)}function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}var Math_abs=Math.abs;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_min=Math.min;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["preloadedImages"]={};Module["preloadedAudios"]={};var memoryInitializer=null;var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return String.prototype.startsWith?filename.startsWith(dataURIPrefix):filename.indexOf(dataURIPrefix)===0}STATIC_BASE=GLOBAL_BASE;memoryInitializer="data:application/octet-stream;base64,AAAAAAAAAAACAAAAAwAAAAEAAAAFAAAABAAAAAYAAAAAAAAAAAAAAAAAAAABAAAAAgAAAAMAAAAEAAAABQAAAAYAAAABAAAABAAAAAMAAAAGAAAABQAAAAIAAAAAAAAAAgAAAAMAAAABAAAABAAAAAYAAAAAAAAABQAAAAMAAAAGAAAABAAAAAUAAAAAAAAAAQAAAAIAAAAEAAAABQAAAAYAAAAAAAAAAgAAAAMAAAABAAAABQAAAAIAAAAAAAAAAQAAAAMAAAAGAAAABAAAAAYAAAAAAAAABQAAAAIAAAABAAAABAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAgAAAAMAAAAAAAAAAAAAAAIAAAAAAAAAAQAAAAMAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAEAAAABgAAAAAAAAAFAAAAAAAAAAAAAAAEAAAABQAAAAAAAAAAAAAAAAAAAAIAAAAAAAAABgAAAAAAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAACAAAAAwAAAAQAAAAFAAAABgAAAAEAAAACAAAAAwAAAAQAAAAFAAAABgAAAAAAAAACAAAAAwAAAAQAAAAFAAAABgAAAAAAAAABAAAAAwAAAAQAAAAFAAAABgAAAAAAAAABAAAAAgAAAAQAAAAFAAAABgAAAAAAAAABAAAAAgAAAAMAAAAFAAAABgAAAAAAAAABAAAAAgAAAAMAAAAEAAAABgAAAAAAAAABAAAAAgAAAAMAAAAEAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAADAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAACAAAAAgAAAAAAAAAAAAAABgAAAAAAAAADAAAAAgAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAUAAAAEAAAAAAAAAAEAAAAAAAAAAAAAAAUAAAAFAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAEAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAUAAAACAAAABAAAAAMAAAAIAAAAAQAAAAcAAAAGAAAACQAAAAAAAAADAAAAAgAAAAIAAAAGAAAACgAAAAsAAAAAAAAAAQAAAAUAAAADAAAADQAAAAEAAAAHAAAABAAAAAwAAAAAAAAABAAAAH8AAAAPAAAACAAAAAMAAAAAAAAADAAAAAUAAAACAAAAEgAAAAoAAAAIAAAAAAAAABAAAAAGAAAADgAAAAsAAAARAAAAAQAAAAkAAAACAAAABwAAABUAAAAJAAAAEwAAAAMAAAANAAAAAQAAAAgAAAAFAAAAFgAAABAAAAAEAAAAAAAAAA8AAAAJAAAAEwAAAA4AAAAUAAAAAQAAAAcAAAAGAAAACgAAAAsAAAAYAAAAFwAAAAUAAAACAAAAEgAAAAsAAAARAAAAFwAAABkAAAACAAAABgAAAAoAAAAMAAAAHAAAAA0AAAAaAAAABAAAAA8AAAADAAAADQAAABoAAAAVAAAAHQAAAAMAAAAMAAAABwAAAA4AAAB/AAAAEQAAABsAAAAJAAAAFAAAAAYAAAAPAAAAFgAAABwAAAAfAAAABAAAAAgAAAAMAAAAEAAAABIAAAAhAAAAHgAAAAgAAAAFAAAAFgAAABEAAAALAAAADgAAAAYAAAAjAAAAGQAAABsAAAASAAAAGAAAAB4AAAAgAAAABQAAAAoAAAAQAAAAEwAAACIAAAAUAAAAJAAAAAcAAAAVAAAACQAAABQAAAAOAAAAEwAAAAkAAAAoAAAAGwAAACQAAAAVAAAAJgAAABMAAAAiAAAADQAAAB0AAAAHAAAAFgAAABAAAAApAAAAIQAAAA8AAAAIAAAAHwAAABcAAAAYAAAACwAAAAoAAAAnAAAAJQAAABkAAAAYAAAAfwAAACAAAAAlAAAACgAAABcAAAASAAAAGQAAABcAAAARAAAACwAAAC0AAAAnAAAAIwAAABoAAAAqAAAAHQAAACsAAAAMAAAAHAAAAA0AAAAbAAAAKAAAACMAAAAuAAAADgAAABQAAAARAAAAHAAAAB8AAAAqAAAALAAAAAwAAAAPAAAAGgAAAB0AAAArAAAAJgAAAC8AAAANAAAAGgAAABUAAAAeAAAAIAAAADAAAAAyAAAAEAAAABIAAAAhAAAAHwAAACkAAAAsAAAANQAAAA8AAAAWAAAAHAAAACAAAAAeAAAAGAAAABIAAAA0AAAAMgAAACUAAAAhAAAAHgAAADEAAAAwAAAAFgAAABAAAAApAAAAIgAAABMAAAAmAAAAFQAAADYAAAAkAAAAMwAAACMAAAAuAAAALQAAADgAAAARAAAAGwAAABkAAAAkAAAAFAAAACIAAAATAAAANwAAACgAAAA2AAAAJQAAACcAAAA0AAAAOQAAABgAAAAXAAAAIAAAACYAAAB/AAAAIgAAADMAAAAdAAAALwAAABUAAAAnAAAAJQAAABkAAAAXAAAAOwAAADkAAAAtAAAAKAAAABsAAAAkAAAAFAAAADwAAAAuAAAANwAAACkAAAAxAAAANQAAAD0AAAAWAAAAIQAAAB8AAAAqAAAAOgAAACsAAAA+AAAAHAAAACwAAAAaAAAAKwAAAD4AAAAvAAAAQAAAABoAAAAqAAAAHQAAACwAAAA1AAAAOgAAAEEAAAAcAAAAHwAAACoAAAAtAAAAJwAAACMAAAAZAAAAPwAAADsAAAA4AAAALgAAADwAAAA4AAAARAAAABsAAAAoAAAAIwAAAC8AAAAmAAAAKwAAAB0AAABFAAAAMwAAAEAAAAAwAAAAMQAAAB4AAAAhAAAAQwAAAEIAAAAyAAAAMQAAAH8AAAA9AAAAQgAAACEAAAAwAAAAKQAAADIAAAAwAAAAIAAAAB4AAABGAAAAQwAAADQAAAAzAAAARQAAADYAAABHAAAAJgAAAC8AAAAiAAAANAAAADkAAABGAAAASgAAACAAAAAlAAAAMgAAADUAAAA9AAAAQQAAAEsAAAAfAAAAKQAAACwAAAA2AAAARwAAADcAAABJAAAAIgAAADMAAAAkAAAANwAAACgAAAA2AAAAJAAAAEgAAAA8AAAASQAAADgAAABEAAAAPwAAAE0AAAAjAAAALgAAAC0AAAA5AAAAOwAAAEoAAABOAAAAJQAAACcAAAA0AAAAOgAAAH8AAAA+AAAATAAAACwAAABBAAAAKgAAADsAAAA/AAAATgAAAE8AAAAnAAAALQAAADkAAAA8AAAASAAAAEQAAABQAAAAKAAAADcAAAAuAAAAPQAAADUAAAAxAAAAKQAAAFEAAABLAAAAQgAAAD4AAAArAAAAOgAAACoAAABSAAAAQAAAAEwAAAA/AAAAfwAAADgAAAAtAAAATwAAADsAAABNAAAAQAAAAC8AAAA+AAAAKwAAAFQAAABFAAAAUgAAAEEAAAA6AAAANQAAACwAAABWAAAATAAAAEsAAABCAAAAQwAAAFEAAABVAAAAMQAAADAAAAA9AAAAQwAAAEIAAAAyAAAAMAAAAFcAAABVAAAARgAAAEQAAAA4AAAAPAAAAC4AAABaAAAATQAAAFAAAABFAAAAMwAAAEAAAAAvAAAAWQAAAEcAAABUAAAARgAAAEMAAAA0AAAAMgAAAFMAAABXAAAASgAAAEcAAABZAAAASQAAAFsAAAAzAAAARQAAADYAAABIAAAAfwAAAEkAAAA3AAAAUAAAADwAAABYAAAASQAAAFsAAABIAAAAWAAAADYAAABHAAAANwAAAEoAAABOAAAAUwAAAFwAAAA0AAAAOQAAAEYAAABLAAAAQQAAAD0AAAA1AAAAXgAAAFYAAABRAAAATAAAAFYAAABSAAAAYAAAADoAAABBAAAAPgAAAE0AAAA/AAAARAAAADgAAABdAAAATwAAAFoAAABOAAAASgAAADsAAAA5AAAAXwAAAFwAAABPAAAATwAAAE4AAAA/AAAAOwAAAF0AAABfAAAATQAAAFAAAABEAAAASAAAADwAAABjAAAAWgAAAFgAAABRAAAAVQAAAF4AAABlAAAAPQAAAEIAAABLAAAAUgAAAGAAAABUAAAAYgAAAD4AAABMAAAAQAAAAFMAAAB/AAAASgAAAEYAAABkAAAAVwAAAFwAAABUAAAARQAAAFIAAABAAAAAYQAAAFkAAABiAAAAVQAAAFcAAABlAAAAZgAAAEIAAABDAAAAUQAAAFYAAABMAAAASwAAAEEAAABoAAAAYAAAAF4AAABXAAAAUwAAAGYAAABkAAAAQwAAAEYAAABVAAAAWAAAAEgAAABbAAAASQAAAGMAAABQAAAAaQAAAFkAAABhAAAAWwAAAGcAAABFAAAAVAAAAEcAAABaAAAATQAAAFAAAABEAAAAagAAAF0AAABjAAAAWwAAAEkAAABZAAAARwAAAGkAAABYAAAAZwAAAFwAAABTAAAATgAAAEoAAABsAAAAZAAAAF8AAABdAAAATwAAAFoAAABNAAAAbQAAAF8AAABqAAAAXgAAAFYAAABRAAAASwAAAGsAAABoAAAAZQAAAF8AAABcAAAATwAAAE4AAABtAAAAbAAAAF0AAABgAAAAaAAAAGIAAABuAAAATAAAAFYAAABSAAAAYQAAAH8AAABiAAAAVAAAAGcAAABZAAAAbwAAAGIAAABuAAAAYQAAAG8AAABSAAAAYAAAAFQAAABjAAAAUAAAAGkAAABYAAAAagAAAFoAAABxAAAAZAAAAGYAAABTAAAAVwAAAGwAAAByAAAAXAAAAGUAAABmAAAAawAAAHAAAABRAAAAVQAAAF4AAABmAAAAZQAAAFcAAABVAAAAcgAAAHAAAABkAAAAZwAAAFsAAABhAAAAWQAAAHQAAABpAAAAbwAAAGgAAABrAAAAbgAAAHMAAABWAAAAXgAAAGAAAABpAAAAWAAAAGcAAABbAAAAcQAAAGMAAAB0AAAAagAAAF0AAABjAAAAWgAAAHUAAABtAAAAcQAAAGsAAAB/AAAAZQAAAF4AAABzAAAAaAAAAHAAAABsAAAAZAAAAF8AAABcAAAAdgAAAHIAAABtAAAAbQAAAGwAAABdAAAAXwAAAHUAAAB2AAAAagAAAG4AAABiAAAAaAAAAGAAAAB3AAAAbwAAAHMAAABvAAAAYQAAAG4AAABiAAAAdAAAAGcAAAB3AAAAcAAAAGsAAABmAAAAZQAAAHgAAABzAAAAcgAAAHEAAABjAAAAdAAAAGkAAAB1AAAAagAAAHkAAAByAAAAcAAAAGQAAABmAAAAdgAAAHgAAABsAAAAcwAAAG4AAABrAAAAaAAAAHgAAAB3AAAAcAAAAHQAAABnAAAAdwAAAG8AAABxAAAAaQAAAHkAAAB1AAAAfwAAAG0AAAB2AAAAcQAAAHkAAABqAAAAdgAAAHgAAABsAAAAcgAAAHUAAAB5AAAAbQAAAHcAAABvAAAAcwAAAG4AAAB5AAAAdAAAAHgAAAB4AAAAcwAAAHIAAABwAAAAeQAAAHcAAAB2AAAAeQAAAHQAAAB4AAAAdwAAAHUAAABxAAAAdgAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAEAAAAFAAAAAQAAAAAAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAIAAAAFAAAAAQAAAAAAAAD/////AQAAAAAAAAADAAAABAAAAAIAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAwAAAAUAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAUAAAABAAAAAAAAAAAAAAABAAAAAwAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAQAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAAwAAAAMAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAMAAAAFAAAAAQAAAAAAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAEAAAAAAAAA/////wMAAAAAAAAABQAAAAIAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAQAAAAFAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAwAAAAMAAAADAAAAAwAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAwAAAAUAAAAFAAAAAAAAAAAAAAADAAAAAwAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAMAAAADAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAUAAAAFAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAEAAAAAAAAAAwAAAAMAAAADAAAAAAAAAAMAAAAAAAAAAAAAAP////8DAAAAAAAAAAUAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAADAAAAAwAAAAAAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAEAAAAAAAAAAAAAAAEAAAADAAAAAAAAAAAAAAABAAAAAAAAAAMAAAADAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAwAAAAMAAAADAAAAAwAAAAAAAAADAAAAAAAAAAAAAAABAAAAAwAAAAAAAAAAAAAAAQAAAAAAAAADAAAAAwAAAAMAAAADAAAAAAAAAAMAAAAAAAAAAAAAAAMAAAAAAAAAAwAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAwAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAwAAAAMAAAAAAAAA/////wMAAAAAAAAABQAAAAIAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAMAAAADAAAAAAAAAAAAAAADAAAAAAAAAAAAAAADAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAADAAAABQAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAUAAAAFAAAAAAAAAAAAAAADAAAAAwAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAADAAAAAAAAAAAAAAABAAAAAAAAAAAAAAADAAAAAAAAAAAAAAADAAAAAwAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAwAAAAAAAAAAAAAAAwAAAAMAAAADAAAAAAAAAAMAAAAAAAAAAAAAAAMAAAADAAAAAwAAAAAAAAADAAAAAAAAAAAAAAD/////AwAAAAAAAAAFAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAADAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAADAAAAAwAAAAAAAAAAAAAAAwAAAAAAAAADAAAAAAAAAAMAAAAAAAAAAwAAAAMAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAMAAAAAAAAAAwAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAwAAAAMAAAAAAAAAAwAAAAMAAAADAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAADAAAAAAAAAAAAAAD/////AwAAAAAAAAAFAAAAAgAAAAAAAAAAAAAAAwAAAAMAAAADAAAAAwAAAAMAAAAAAAAAAAAAAAMAAAADAAAAAwAAAAMAAAADAAAAAAAAAAAAAAADAAAAAwAAAAMAAAADAAAAAAAAAAMAAAAAAAAAAwAAAAMAAAADAAAAAwAAAAAAAAADAAAAAAAAAP////8DAAAAAAAAAAUAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAMAAAAAAAAAAwAAAAMAAAADAAAAAAAAAAMAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAADAAAAAwAAAAAAAAADAAAAAAAAAAAAAAADAAAAAwAAAAAAAAAAAAAAAwAAAAMAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAMAAAADAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAwAAAAMAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAMAAAAAAAAAAAAAAP////8DAAAAAAAAAAUAAAACAAAAAAAAAAAAAAADAAAAAwAAAAMAAAAAAAAAAAAAAAMAAAAAAAAAAwAAAAMAAAADAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAwAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAwAAAAMAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAUAAAAAAAAAAAAAAAMAAAADAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAMAAAABAAAAAAAAAAEAAAAAAAAAAAAAAAEAAAADAAAAAQAAAAAAAAABAAAAAAAAAAAAAAADAAAAAAAAAAMAAAAAAAAAAwAAAAAAAAAAAAAAAwAAAAAAAAADAAAAAAAAAAMAAAAAAAAA/////wMAAAAAAAAABQAAAAIAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAADAAAAAwAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAwAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAwAAAAMAAAAAAAAAAAAAAAMAAAADAAAAAwAAAAMAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAABQAAAAAAAAAAAAAAAwAAAAMAAAADAAAAAwAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAADAAAAAwAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAUAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAUAAAAFAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAwAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAADAAAAAAAAAAAAAAD/////AwAAAAAAAAAFAAAAAgAAAAAAAAAAAAAAAwAAAAMAAAADAAAAAAAAAAAAAAADAAAAAAAAAAUAAAAAAAAAAAAAAAUAAAAFAAAAAAAAAAAAAAAAAAAAAQAAAAMAAAABAAAAAAAAAAEAAAAAAAAAAwAAAAMAAAADAAAAAAAAAAAAAAADAAAAAAAAAAMAAAADAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAMAAAABAAAAAAAAAAEAAAAAAAAAAwAAAAMAAAADAAAAAwAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAQAAAAAAAAADAAAABQAAAAEAAAAAAAAA/////wMAAAAAAAAABQAAAAIAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAUAAAAFAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAEAAAABQAAAAEAAAAAAAAAAwAAAAMAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAgAAAAUAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAQAAAAMAAAABAAAAAAAAAAEAAAAAAAAABQAAAAAAAAAAAAAABQAAAAUAAAAAAAAAAAAAAP////8BAAAAAAAAAAMAAAAEAAAAAgAAAAAAAAAAAAAAAQAAAAAAAAAAAAAABQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAUAAAAAAAAAAAAAAAUAAAAFAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAABAAAABQAAAAEAAAAAAAAAAAAAAAEAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAQAAAP//////////AQAAAAEAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAABAAAAAQAAAAAAAAAAAAAAAAAAAAMAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAIAAAAAAAAAAAAAAAEAAAACAAAABgAAAAQAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAEAAAABAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAoAAAACAAAAAAAAAAAAAAABAAAAAQAAAAUAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAEAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAIAAAAAAAAAAAAAAAEAAAADAAAABwAAAAYAAAABAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAHAAAAAQAAAAAAAAABAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAEAAAABAAAAAAAAAAAAAAAAAAAABAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAOAAAAAgAAAAAAAAAAAAAAAQAAAAAAAAAJAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAABAAAAAQAAAAAAAAAAAAAAAAAAAAwAAAABAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANAAAAAgAAAAAAAAAAAAAAAQAAAAQAAAAIAAAACgAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAsAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAJAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAACAAAAAAAAAAAAAAABAAAACwAAAA8AAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA4AAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAABAAAAAQAAAAAAAAAAAAAAAAAAAAgAAAABAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAFAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAACAAAAAAAAAAAAAAABAAAADAAAABAAAAAMAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAACgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAABAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAANAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAIAAAAAAAAAAAAAAAEAAAAKAAAAEwAAAAgAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAAAEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAEAAAABAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAABAAAAABAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAJAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAgAAAAAAAAAAAAAAAQAAAA0AAAARAAAADQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAABEAAAABAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAATAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAABMAAAAAAAAAAQAAAAEAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAADQAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAAAIAAAAAAAAAAAAAAAEAAAAOAAAAEgAAAA8AAAABAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAPAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgAAAAAAAAABAAAAAQAAAAAAAAAAAAAAAAAAABIAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAATAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAEQAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAEgAAAAEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAABMAAAACAAAAAAAAAAAAAAABAAAA//////////8TAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMAAAABAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAASAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAABIAAAAAAAAAGAAAAAAAAAAhAAAAAAAAAB4AAAAAAAAAIAAAAAMAAAAxAAAAAQAAADAAAAADAAAAMgAAAAMAAAAIAAAAAAAAAAUAAAAFAAAACgAAAAUAAAAWAAAAAAAAABAAAAAAAAAAEgAAAAAAAAApAAAAAQAAACEAAAAAAAAAHgAAAAAAAAAEAAAAAAAAAAAAAAAFAAAAAgAAAAUAAAAPAAAAAQAAAAgAAAAAAAAABQAAAAUAAAAfAAAAAQAAABYAAAAAAAAAEAAAAAAAAAACAAAAAAAAAAYAAAAAAAAADgAAAAAAAAAKAAAAAAAAAAsAAAAAAAAAEQAAAAMAAAAYAAAAAQAAABcAAAADAAAAGQAAAAMAAAAAAAAAAAAAAAEAAAAFAAAACQAAAAUAAAAFAAAAAAAAAAIAAAAAAAAABgAAAAAAAAASAAAAAQAAAAoAAAAAAAAACwAAAAAAAAAEAAAAAQAAAAMAAAAFAAAABwAAAAUAAAAIAAAAAQAAAAAAAAAAAAAAAQAAAAUAAAAQAAAAAQAAAAUAAAAAAAAAAgAAAAAAAAAHAAAAAAAAABUAAAAAAAAAJgAAAAAAAAAJAAAAAAAAABMAAAAAAAAAIgAAAAMAAAAOAAAAAQAAABQAAAADAAAAJAAAAAMAAAADAAAAAAAAAA0AAAAFAAAAHQAAAAUAAAABAAAAAAAAAAcAAAAAAAAAFQAAAAAAAAAGAAAA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/////+4hGQD/////gu2vAAAAAAAAAAAAAAAAAAAAAAACAAAA//////////8BAAAAAwAAAP//////////////////////////////////////////////////////////////////////////AQAAAAAAAAACAAAA////////////////AwAAAP//////////////////////////////////////////////////////////////////////////AQAAAAAAAAACAAAA////////////////AwAAAP//////////////////////////////////////////////////////////////////////////AQAAAAAAAAACAAAA////////////////AwAAAP//////////////////////////////////////////////////////////AgAAAP//////////AQAAAAAAAAD/////////////////////AwAAAP////////////////////////////////////////////////////8DAAAA/////////////////////wAAAAD/////////////////////AQAAAP///////////////wIAAAD///////////////////////////////8DAAAA/////////////////////wAAAAD///////////////8CAAAAAQAAAP////////////////////////////////////////////////////8DAAAA/////////////////////wAAAAD///////////////8CAAAAAQAAAP////////////////////////////////////////////////////8DAAAA/////////////////////wAAAAD///////////////8CAAAAAQAAAP////////////////////////////////////////////////////8DAAAA/////////////////////wAAAAD///////////////8CAAAAAQAAAP////////////////////////////////////////////////////8BAAAAAgAAAP///////////////wAAAAD/////////////////////AwAAAP////////////////////////////////////////////////////8BAAAAAgAAAP///////////////wAAAAD/////////////////////AwAAAP////////////////////////////////////////////////////8BAAAAAgAAAP///////////////wAAAAD/////////////////////AwAAAP////////////////////////////////////////////////////8BAAAAAgAAAP///////////////wAAAAD/////////////////////AwAAAP///////////////////////////////wIAAAD///////////////8BAAAA/////////////////////wAAAAD/////////////////////AwAAAP////////////////////////////////////////////////////8DAAAA/////////////////////wAAAAABAAAA//////////8CAAAA//////////////////////////////////////////////////////////8DAAAA////////////////AgAAAAAAAAABAAAA//////////////////////////////////////////////////////////////////////////8DAAAA////////////////AgAAAAAAAAABAAAA//////////////////////////////////////////////////////////////////////////8DAAAA////////////////AgAAAAAAAAABAAAA//////////////////////////////////////////////////////////////////////////8DAAAAAQAAAP//////////AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAACAAAAAAAAAAIAAAABAAAAAQAAAAIAAAACAAAAAAAAAAUAAAAFAAAAAAAAAAIAAAACAAAAAwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAgAAAAEAAAACAAAAAgAAAAIAAAAAAAAABQAAAAYAAAAAAAAAAgAAAAIAAAADAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAgAAAAAAAAACAAAAAQAAAAMAAAACAAAAAgAAAAAAAAAFAAAABwAAAAAAAAACAAAAAgAAAAMAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAACAAAAAAAAAAIAAAABAAAABAAAAAIAAAACAAAAAAAAAAUAAAAIAAAAAAAAAAIAAAACAAAAAwAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAIAAAAAAAAAAgAAAAEAAAAAAAAAAgAAAAIAAAAAAAAABQAAAAkAAAAAAAAAAgAAAAIAAAADAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAKAAAAAgAAAAIAAAAAAAAAAwAAAA4AAAACAAAAAAAAAAIAAAADAAAAAAAAAAAAAAACAAAAAgAAAAMAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAsAAAACAAAAAgAAAAAAAAADAAAACgAAAAIAAAAAAAAAAgAAAAMAAAABAAAAAAAAAAIAAAACAAAAAwAAAAcAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAIAAAACAAAAAAAAAAMAAAALAAAAAgAAAAAAAAACAAAAAwAAAAIAAAAAAAAAAgAAAAIAAAADAAAACAAAAAAAAAAAAAAAAAAAAAAAAAANAAAAAgAAAAIAAAAAAAAAAwAAAAwAAAACAAAAAAAAAAIAAAADAAAAAwAAAAAAAAACAAAAAgAAAAMAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAACAAAAAgAAAAAAAAADAAAADQAAAAIAAAAAAAAAAgAAAAMAAAAEAAAAAAAAAAIAAAACAAAAAwAAAAoAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAIAAAACAAAAAAAAAAMAAAAGAAAAAgAAAAAAAAACAAAAAwAAAA8AAAAAAAAAAgAAAAIAAAADAAAACwAAAAAAAAAAAAAAAAAAAAAAAAAGAAAAAgAAAAIAAAAAAAAAAwAAAAcAAAACAAAAAAAAAAIAAAADAAAAEAAAAAAAAAACAAAAAgAAAAMAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAACAAAAAgAAAAAAAAADAAAACAAAAAIAAAAAAAAAAgAAAAMAAAARAAAAAAAAAAIAAAACAAAAAwAAAA0AAAAAAAAAAAAAAAAAAAAAAAAACAAAAAIAAAACAAAA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TABpbm5lckxvb3BzICE9IE5VTEwAbm9ybWFsaXplTXVsdGlQb2x5Z29uAGJib3hlcyAhPSBOVUxMAGNhbmRpZGF0ZXMgIT0gTlVMTABmaW5kUG9seWdvbkZvckhvbGUAY2FuZGlkYXRlQkJveGVzICE9IE5VTEwAcmV2RGlyICE9IElOVkFMSURfRElHSVQAbG9jYWxpai5jAGgzVG9Mb2NhbElqawBiYXNlQ2VsbCAhPSBvcmlnaW5CYXNlQ2VsbAAhKG9yaWdpbk9uUGVudCAmJiBpbmRleE9uUGVudCkAcGVudGFnb25Sb3RhdGlvbnMgPj0gMABkaXJlY3Rpb25Sb3RhdGlvbnMgPj0gMABiYXNlQ2VsbCA9PSBvcmlnaW5CYXNlQ2VsbABiYXNlQ2VsbCAhPSBJTlZBTElEX0JBU0VfQ0VMTABsb2NhbElqa1RvSDMAIV9pc0Jhc2VDZWxsUGVudGFnb24oYmFzZUNlbGwpAGJhc2VDZWxsUm90YXRpb25zID49IDAAd2l0aGluUGVudGFnb25Sb3RhdGlvbnMgPj0gMABncmFwaC0+YnVja2V0cyAhPSBOVUxMAHZlcnRleEdyYXBoLmMAaW5pdFZlcnRleEdyYXBoAG5vZGUgIT0gTlVMTABhZGRWZXJ0ZXhOb2Rl";var tempDoublePtr=23792;function ___assert_fail(condition,filename,line,func){abort("Assertion failed: "+UTF8ToString(condition)+", at: "+[filename?UTF8ToString(filename):"unknown filename",line,func?UTF8ToString(func):"unknown function"])}function _emscripten_get_heap_size(){return TOTAL_MEMORY}function _emscripten_resize_heap(requestedSize){var oldSize=_emscripten_get_heap_size();var PAGE_MULTIPLE=16777216;var LIMIT=2147483648-PAGE_MULTIPLE;if(requestedSize>LIMIT){return false}var MIN_TOTAL_MEMORY=16777216;var newSize=Math.max(oldSize,MIN_TOTAL_MEMORY);while(newSize<requestedSize){if(newSize<=536870912){newSize=alignUp(2*newSize,PAGE_MULTIPLE)}else{newSize=Math.min(alignUp((3*newSize+2147483648)/4,PAGE_MULTIPLE),LIMIT)}}var replacement=Module["reallocBuffer"](newSize);if(!replacement||replacement.byteLength!=newSize){return false}updateGlobalBuffer(replacement);updateGlobalBufferViews();TOTAL_MEMORY=newSize;HEAPU32[DYNAMICTOP_PTR>>2]=requestedSize;return true}function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest)}function ___setErrNo(value){if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;return value}var ASSERTIONS=false;function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>255){if(ASSERTIONS){assert(false,"Character code "+chr+" ("+String.fromCharCode(chr)+")  at offset "+i+" not in 0x00-0xFF.")}chr&=255}ret.push(String.fromCharCode(chr))}return ret.join("")}var decodeBase64=typeof atob==="function"?atob:(function(input){var keyStr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var output="";var chr1,chr2,chr3;var enc1,enc2,enc3,enc4;var i=0;input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");do{enc1=keyStr.indexOf(input.charAt(i++));enc2=keyStr.indexOf(input.charAt(i++));enc3=keyStr.indexOf(input.charAt(i++));enc4=keyStr.indexOf(input.charAt(i++));chr1=enc1<<2|enc2>>4;chr2=(enc2&15)<<4|enc3>>2;chr3=(enc3&3)<<6|enc4;output=output+String.fromCharCode(chr1);if(enc3!==64){output=output+String.fromCharCode(chr2)}if(enc4!==64){output=output+String.fromCharCode(chr3)}}while(i<input.length);return output});function intArrayFromBase64(s){if(typeof ENVIRONMENT_IS_NODE==="boolean"&&ENVIRONMENT_IS_NODE){var buf;try{buf=Buffer.from(s,"base64")}catch(_){buf=new Buffer(s,"base64")}return new Uint8Array(buf.buffer,buf.byteOffset,buf.byteLength)}try{var decoded=decodeBase64(s);var bytes=new Uint8Array(decoded.length);for(var i=0;i<decoded.length;++i){bytes[i]=decoded.charCodeAt(i)}return bytes}catch(_){throw new Error("Converting base64 string to bytes failed.")}}function tryParseAsDataURI(filename){if(!isDataURI(filename)){return}return intArrayFromBase64(filename.slice(dataURIPrefix.length))}var asmGlobalArg={"Math":Math,"Int8Array":Int8Array,"Int16Array":Int16Array,"Int32Array":Int32Array,"Uint8Array":Uint8Array,"Uint16Array":Uint16Array,"Uint32Array":Uint32Array,"Float32Array":Float32Array,"Float64Array":Float64Array,"NaN":NaN,"Infinity":Infinity,"byteLength":byteLength};Module.asmLibraryArg={"a":abort,"b":assert,"c":setTempRet0,"d":getTempRet0,"e":abortOnCannotGrowMemory,"f":___assert_fail,"g":___setErrNo,"h":_emscripten_get_heap_size,"i":_emscripten_memcpy_big,"j":_emscripten_resize_heap,"k":DYNAMICTOP_PTR,"l":tempDoublePtr};// EMSCRIPTEN_START_ASM
var asm=(/** @suppress {uselessCode} */ function(global,env,buffer) {
"almost asm";var a=global.Int8Array;var b=new a(buffer);var c=global.Int16Array;var d=new c(buffer);var e=global.Int32Array;var f=new e(buffer);var g=global.Uint8Array;var h=new g(buffer);var i=global.Uint16Array;var j=new i(buffer);var k=global.Uint32Array;var l=new k(buffer);var m=global.Float32Array;var n=new m(buffer);var o=global.Float64Array;var p=new o(buffer);var q=global.byteLength;var r=env.k|0;var s=env.l|0;var t=0;var u=0;var v=0;var w=0;var x=global.NaN,y=global.Infinity;var z=0,A=0,B=0,C=0,D=0.0;var E=global.Math.floor;var F=global.Math.abs;var G=global.Math.sqrt;var H=global.Math.pow;var I=global.Math.cos;var J=global.Math.sin;var K=global.Math.tan;var L=global.Math.acos;var M=global.Math.asin;var N=global.Math.atan;var O=global.Math.atan2;var P=global.Math.exp;var Q=global.Math.log;var R=global.Math.ceil;var S=global.Math.imul;var T=global.Math.min;var U=global.Math.max;var V=global.Math.clz32;var W=env.a;var X=env.b;var Y=env.c;var Z=env.d;var _=env.e;var $=env.f;var aa=env.g;var ba=env.h;var ca=env.i;var da=env.j;var ea=23808;var fa=5266688;var ga=0.0;function ha(newBuffer){if(q(newBuffer)&16777215||q(newBuffer)<=16777215||q(newBuffer)>2147483648)return false;b=new a(newBuffer);d=new c(newBuffer);f=new e(newBuffer);h=new g(newBuffer);j=new i(newBuffer);l=new k(newBuffer);n=new m(newBuffer);p=new o(newBuffer);buffer=newBuffer;return true}
// EMSCRIPTEN_START_FUNCS
function ia(a){a=a|0;var b=0;b=ea;ea=ea+a|0;ea=ea+15&-16;return b|0}function ja(){return ea|0}function ka(a){a=a|0;ea=a}function la(a,b){a=a|0;b=b|0;ea=a;fa=b}function ma(a,b){a=a|0;b=b|0;if(!t){t=a;u=b}}function na(a){a=a|0;return (S(a*3|0,a+1|0)|0)+1|0}function oa(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0;e=(S(c*3|0,c+1|0)|0)+1|0;f=e<<2;g=Nc(f)|0;if(!(qa(a,b,c,d,g)|0)){Oc(g);return}ad(d|0,0,e<<3|0)|0;ad(g|0,0,f|0)|0;ra(a,b,c,d,g,e,0);Oc(g);return}function pa(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0;f=(S(c*3|0,c+1|0)|0)+1|0;if(!(qa(a,b,c,d,e)|0))return;ad(d|0,0,f<<3|0)|0;ad(e|0,0,f<<2|0)|0;ra(a,b,c,d,e,f,0);return}function qa(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;o=ea;ea=ea+16|0;n=o;g=d;f[g>>2]=a;f[g+4>>2]=b;g=(e|0)!=0;if(g)f[e>>2]=0;if(Gb(a,b)|0){n=1;ea=o;return n|0}f[n>>2]=0;a:do if((c|0)>=1)if(g){k=0;l=1;m=1;h=0;g=a;while(1){if(!(h|k)){g=sa(g,b,4,n)|0;b=Z()|0;if((g|0)==0&(b|0)==0){g=2;break a}if(Gb(g,b)|0){g=1;break a}}g=sa(g,b,f[16+(k<<2)>>2]|0,n)|0;b=Z()|0;if((g|0)==0&(b|0)==0){g=2;break a}a=d+(m<<3)|0;f[a>>2]=g;f[a+4>>2]=b;f[e+(m<<2)>>2]=l;h=h+1|0;a=(h|0)==(l|0);i=k+1|0;j=(i|0)==6;if(Gb(g,b)|0){g=1;break a}l=l+(j&a&1)|0;if((l|0)>(c|0)){g=0;break}else{k=a?(j?0:i):k;m=m+1|0;h=a?0:h}}}else{k=0;l=1;m=1;h=0;g=a;while(1){if(!(h|k)){g=sa(g,b,4,n)|0;b=Z()|0;if((g|0)==0&(b|0)==0){g=2;break a}if(Gb(g,b)|0){g=1;break a}}g=sa(g,b,f[16+(k<<2)>>2]|0,n)|0;b=Z()|0;if((g|0)==0&(b|0)==0){g=2;break a}a=d+(m<<3)|0;f[a>>2]=g;f[a+4>>2]=b;h=h+1|0;a=(h|0)==(l|0);i=k+1|0;j=(i|0)==6;if(Gb(g,b)|0){g=1;break a}l=l+(j&a&1)|0;if((l|0)>(c|0)){g=0;break}else{k=a?(j?0:i):k;m=m+1|0;h=a?0:h}}}else g=0;while(0);n=g;ea=o;return n|0}function ra(a,b,c,d,e,g,h){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0;m=ea;ea=ea+16|0;l=m;if((a|0)==0&(b|0)==0){ea=m;return}i=Xc(a|0,b|0,g|0,((g|0)<0)<<31>>31|0)|0;Z()|0;j=d+(i<<3)|0;n=j;o=f[n>>2]|0;n=f[n+4>>2]|0;k=(o|0)==(a|0)&(n|0)==(b|0);if(!((o|0)==0&(n|0)==0|k))do{i=(i+1|0)%(g|0)|0;j=d+(i<<3)|0;o=j;n=f[o>>2]|0;o=f[o+4>>2]|0;k=(n|0)==(a|0)&(o|0)==(b|0)}while(!((n|0)==0&(o|0)==0|k));i=e+(i<<2)|0;if(k?(f[i>>2]|0)<=(h|0):0){ea=m;return}o=j;f[o>>2]=a;f[o+4>>2]=b;f[i>>2]=h;if((h|0)>=(c|0)){ea=m;return}o=h+1|0;f[l>>2]=0;n=sa(a,b,2,l)|0;ra(n,Z()|0,c,d,e,g,o);f[l>>2]=0;n=sa(a,b,3,l)|0;ra(n,Z()|0,c,d,e,g,o);f[l>>2]=0;n=sa(a,b,1,l)|0;ra(n,Z()|0,c,d,e,g,o);f[l>>2]=0;n=sa(a,b,5,l)|0;ra(n,Z()|0,c,d,e,g,o);f[l>>2]=0;n=sa(a,b,4,l)|0;ra(n,Z()|0,c,d,e,g,o);f[l>>2]=0;n=sa(a,b,6,l)|0;ra(n,Z()|0,c,d,e,g,o);ea=m;return}function sa(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;if((f[d>>2]|0)>0){e=0;do{c=_a(c)|0;e=e+1|0}while((e|0)<(f[d>>2]|0))}i=Yc(a|0,b|0,45)|0;Z()|0;j=i&127;g=Lb(a,b)|0;e=Yc(a|0,b|0,52)|0;Z()|0;e=e&15;a:do if(!e)h=6;else while(1){m=(15-e|0)*3|0;n=Yc(a|0,b|0,m|0)|0;Z()|0;n=n&7;o=(Rb(e)|0)==0;e=e+-1|0;l=Zc(7,0,m|0)|0;b=b&~(Z()|0);m=Zc(f[(o?464:48)+(n*28|0)+(c<<2)>>2]|0,0,m|0)|0;k=Z()|0;c=f[(o?672:256)+(n*28|0)+(c<<2)>>2]|0;a=m|a&~l;b=k|b;if(!c){c=0;break a}if(!e){h=6;break}}while(0);if((h|0)==6){o=f[880+(j*28|0)+(c<<2)>>2]|0;n=Zc(o|0,0,45)|0;a=n|a;b=Z()|0|b&-1040385;c=f[4304+(j*28|0)+(c<<2)>>2]|0;if((o&127|0)==127){o=Zc(f[880+(j*28|0)+20>>2]|0,0,45)|0;b=Z()|0|b&-1040385;c=f[4304+(j*28|0)+20>>2]|0;a=Nb(o|a,b)|0;b=Z()|0;f[d>>2]=(f[d>>2]|0)+1}}h=Yc(a|0,b|0,45)|0;Z()|0;h=h&127;b:do if(!(ya(h)|0)){if((c|0)>0){e=0;do{a=Nb(a,b)|0;b=Z()|0;e=e+1|0}while((e|0)!=(c|0))}}else{c:do if((Lb(a,b)|0)==1){if((j|0)!=(h|0))if(Ca(h,f[7728+(j*28|0)>>2]|0)|0){a=Pb(a,b)|0;g=1;b=Z()|0;break}else{a=Nb(a,b)|0;g=1;b=Z()|0;break}switch(g|0){case 5:{a=Pb(a,b)|0;b=Z()|0;f[d>>2]=(f[d>>2]|0)+5;g=0;break c}case 3:{a=Nb(a,b)|0;b=Z()|0;f[d>>2]=(f[d>>2]|0)+1;g=0;break c}default:{n=0;o=0;Y(n|0);return o|0}}}else g=0;while(0);if((c|0)>0){e=0;do{a=Mb(a,b)|0;b=Z()|0;e=e+1|0}while((e|0)!=(c|0))}if((j|0)!=(h|0)){if(!(za(h)|0)){if((g|0)!=0|(Lb(a,b)|0)!=5)break;f[d>>2]=(f[d>>2]|0)+1;break}switch(i&127){case 8:case 118:break b;default:{}}if((Lb(a,b)|0)!=3)f[d>>2]=(f[d>>2]|0)+1}}while(0);f[d>>2]=((f[d>>2]|0)+c|0)%6|0;n=b;o=a;Y(n|0);return o|0}function ta(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;m=ea;ea=ea+16|0;l=m;if(!c){l=d;f[l>>2]=a;f[l+4>>2]=b;l=0;ea=m;return l|0}f[l>>2]=0;a:do if(!(Gb(a,b)|0)){g=(c|0)>0;if(g){e=0;k=a;do{k=sa(k,b,4,l)|0;b=Z()|0;if((k|0)==0&(b|0)==0){a=2;break a}e=e+1|0;if(Gb(k,b)|0){a=1;break a}}while((e|0)<(c|0));j=d;f[j>>2]=k;f[j+4>>2]=b;j=c+-1|0;if(g){g=0;h=1;e=k;a=b;do{e=sa(e,a,2,l)|0;a=Z()|0;if((e|0)==0&(a|0)==0){a=2;break a}i=d+(h<<3)|0;f[i>>2]=e;f[i+4>>2]=a;h=h+1|0;if(Gb(e,a)|0){a=1;break a}g=g+1|0}while((g|0)<(c|0));i=0;g=h;do{e=sa(e,a,3,l)|0;a=Z()|0;if((e|0)==0&(a|0)==0){a=2;break a}h=d+(g<<3)|0;f[h>>2]=e;f[h+4>>2]=a;g=g+1|0;if(Gb(e,a)|0){a=1;break a}i=i+1|0}while((i|0)<(c|0));h=0;do{e=sa(e,a,1,l)|0;a=Z()|0;if((e|0)==0&(a|0)==0){a=2;break a}i=d+(g<<3)|0;f[i>>2]=e;f[i+4>>2]=a;g=g+1|0;if(Gb(e,a)|0){a=1;break a}h=h+1|0}while((h|0)<(c|0));h=0;do{e=sa(e,a,5,l)|0;a=Z()|0;if((e|0)==0&(a|0)==0){a=2;break a}i=d+(g<<3)|0;f[i>>2]=e;f[i+4>>2]=a;g=g+1|0;if(Gb(e,a)|0){a=1;break a}h=h+1|0}while((h|0)<(c|0));h=0;do{e=sa(e,a,4,l)|0;a=Z()|0;if((e|0)==0&(a|0)==0){a=2;break a}i=d+(g<<3)|0;f[i>>2]=e;f[i+4>>2]=a;g=g+1|0;if(Gb(e,a)|0){a=1;break a}h=h+1|0}while((h|0)<(c|0));h=0;while(1){e=sa(e,a,6,l)|0;a=Z()|0;if((e|0)==0&(a|0)==0){a=2;break a}if((h|0)!=(j|0)){i=d+(g<<3)|0;f[i>>2]=e;f[i+4>>2]=a;if(!(Gb(e,a)|0))g=g+1|0;else{a=1;break a}}h=h+1|0;if((h|0)>=(c|0)){h=k;g=b;break}}}else{h=k;e=k;g=b;a=b}}else{h=d;f[h>>2]=a;f[h+4>>2]=b;h=a;e=a;g=b;a=b}a=((h|0)!=(e|0)|(g|0)!=(a|0))&1}else a=1;while(0);l=a;ea=m;return l|0}function ua(a,b){a=a|0;b=b|0;var c=0,d=0;c=ea;ea=ea+32|0;d=c;rc(a,d);b=Ka(d,b)|0;b=(S(b*3|0,b+1|0)|0)+1|0;ea=c;return b|0}function va(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0.0;m=ea;ea=ea+32|0;d=m+16|0;k=m;l=Nc((f[a+8>>2]<<5)+32|0)|0;if(!l)$(22551,22160,672,22168);sc(a,l);h=Ka(l,b)|0;i=S(h*3|0,h+1|0)|0;j=i+1|0;Ia(l,d);b=Sb(d,b)|0;d=Z()|0;e=j<<2;g=Nc(e)|0;if(qa(b,d,h,c,g)|0){ad(c|0,0,j<<3|0)|0;ad(g|0,0,e|0)|0;ra(b,d,h,c,g,j,0)}Oc(g);if((i|0)<0){Oc(l);ea=m;return}d=k+8|0;b=0;do{e=c+(b<<3)|0;h=e;g=f[h>>2]|0;h=f[h+4>>2]|0;if(!((g|0)==0&(h|0)==0)?(Vb(g,h,k),n=+rb(+p[k>>3]),p[k>>3]=n,n=+sb(+p[d>>3]),p[d>>3]=n,!(tc(a,l,k)|0)):0){i=e;f[i>>2]=0;f[i+4>>2]=0}b=b+1|0}while((b|0)!=(j|0));Oc(l);ea=m;return}function wa(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0;k=ea;ea=ea+176|0;j=k;if((b|0)<1){Gc(c,0,0);ea=k;return}h=a;h=Yc(f[h>>2]|0,f[h+4>>2]|0,52)|0;Z()|0;Gc(c,(b|0)>6?b:6,h&15);h=0;do{d=a+(h<<3)|0;Wb(f[d>>2]|0,f[d+4>>2]|0,j);d=f[j>>2]|0;if((d|0)>0){i=0;do{g=j+8+(i<<4)|0;i=i+1|0;d=j+8+(((i|0)%(d|0)|0)<<4)|0;e=Lc(c,d,g)|0;if(!e)Kc(c,g,d)|0;else Jc(c,e)|0;d=f[j>>2]|0}while((i|0)<(d|0))}h=h+1|0}while((h|0)!=(b|0));ea=k;return}function xa(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0;g=ea;ea=ea+32|0;d=g;e=g+16|0;wa(a,b,e);f[c>>2]=0;f[c+4>>2]=0;f[c+8>>2]=0;a=Ic(e)|0;if(!a){gc(c)|0;Hc(e);ea=g;return}do{b=dc(c)|0;do{ec(b,a)|0;h=a+16|0;f[d>>2]=f[h>>2];f[d+4>>2]=f[h+4>>2];f[d+8>>2]=f[h+8>>2];f[d+12>>2]=f[h+12>>2];Jc(e,a)|0;a=Mc(e,d)|0}while((a|0)!=0);a=Ic(e)|0}while((a|0)!=0);gc(c)|0;Hc(e);ea=g;return}function ya(a){a=a|0;return f[7728+(a*28|0)+16>>2]|0}function za(a){a=a|0;return (a|0)==4|(a|0)==117|0}function Aa(a){a=a|0;return f[11152+((f[a>>2]|0)*216|0)+((f[a+4>>2]|0)*72|0)+((f[a+8>>2]|0)*24|0)+(f[a+12>>2]<<3)>>2]|0}function Ba(a){a=a|0;return f[11152+((f[a>>2]|0)*216|0)+((f[a+4>>2]|0)*72|0)+((f[a+8>>2]|0)*24|0)+(f[a+12>>2]<<3)+4>>2]|0}function Ca(a,b){a=a|0;b=b|0;if((f[7728+(a*28|0)+20>>2]|0)==(b|0)){b=1;return b|0}b=(f[7728+(a*28|0)+24>>2]|0)==(b|0);return b|0}function Da(a,b){a=a|0;b=b|0;return f[880+(a*28|0)+(b<<2)>>2]|0}function Ea(a,b){a=a|0;b=b|0;if((f[880+(a*28|0)>>2]|0)==(b|0)){b=0;return b|0}if((f[880+(a*28|0)+4>>2]|0)==(b|0)){b=1;return b|0}if((f[880+(a*28|0)+8>>2]|0)==(b|0)){b=2;return b|0}if((f[880+(a*28|0)+12>>2]|0)==(b|0)){b=3;return b|0}if((f[880+(a*28|0)+16>>2]|0)==(b|0)){b=4;return b|0}if((f[880+(a*28|0)+20>>2]|0)==(b|0)){b=5;return b|0}else return ((f[880+(a*28|0)+24>>2]|0)==(b|0)?6:7)|0;return 0}function Fa(){return 122}function Ga(a){a=a|0;var b=0,c=0,d=0;b=0;do{Zc(b|0,0,45)|0;d=Z()|0|134225919;c=a+(b<<3)|0;f[c>>2]=-1;f[c+4>>2]=d;b=b+1|0}while((b|0)!=122);return}function Ha(a){a=a|0;return +p[a+16>>3]<+p[a+24>>3]|0}function Ia(a,b){a=a|0;b=b|0;var c=0.0,d=0.0;p[b>>3]=(+p[a>>3]+ +p[a+8>>3])*.5;c=+p[a+16>>3];d=+p[a+24>>3];c=+sb((d+(c<d?c+6.283185307179586:c))*.5);p[b+8>>3]=c;return}function Ja(a,b){a=a|0;b=b|0;var c=0.0,d=0.0,e=0.0;c=+p[b>>3];if(!(c>=+p[a+8>>3])){b=0;return b|0}if(!(c<=+p[a>>3])){b=0;return b|0}d=+p[a+16>>3];c=+p[a+24>>3];e=+p[b+8>>3];b=e>=c;a=e<=d&1;if(d<c){if(b)a=1}else if(!b)a=0;b=(a|0)!=0;return b|0}function Ka(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0.0,g=0,h=0,i=0,j=0.0,k=0.0,l=0;c=ea;ea=ea+224|0;e=c+200|0;d=c+32|0;g=c+16|0;h=c;l=a+8|0;p[g>>3]=(+p[a>>3]+ +p[l>>3])*.5;i=a+16|0;f=+p[i>>3];k=+p[a+24>>3];f=+sb((k+(f<k?f+6.283185307179586:f))*.5);p[g+8>>3]=f;f=+p[a>>3];k=+F(+f);j=+p[l>>3];a=k>+F(+j);p[h>>3]=a?j:f;p[h+8>>3]=+p[i>>3];f=+tb(g,h);a=Sb(g,b)|0;b=Z()|0;Vb(a,b,e);Wb(a,b,d);b=~~+R(+(f/(+tb(e,d+8|0)*1.5)));ea=c;return b|0}function La(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;f[a>>2]=b;f[a+4>>2]=c;f[a+8>>2]=d;return}function Ma(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0.0,i=0.0,j=0.0,k=0.0,l=0,m=0,n=0.0;m=b+8|0;f[m>>2]=0;j=+p[a>>3];h=+F(+j);k=+p[a+8>>3];i=+F(+k)/.8660254037844386;h=h+i*.5;c=~~h;a=~~i;h=h-+(c|0);i=i-+(a|0);do if(h<.5)if(h<.3333333333333333){f[b>>2]=c;if(i<(h+1.0)*.5){f[b+4>>2]=a;break}else{a=a+1|0;f[b+4>>2]=a;break}}else{n=1.0-h;a=(!(i<n)&1)+a|0;f[b+4>>2]=a;if(n<=i&i<h*2.0){c=c+1|0;f[b>>2]=c;break}else{f[b>>2]=c;break}}else{if(!(h<.6666666666666666)){c=c+1|0;f[b>>2]=c;if(i<h*.5){f[b+4>>2]=a;break}else{a=a+1|0;f[b+4>>2]=a;break}}if(i<1.0-h){f[b+4>>2]=a;if(h*2.0+-1.0<i){f[b>>2]=c;break}}else{a=a+1|0;f[b+4>>2]=a}c=c+1|0;f[b>>2]=c}while(0);do if(j<0.0)if(!(a&1)){l=(a|0)/2|0;l=Uc(c|0,((c|0)<0)<<31>>31|0,l|0,((l|0)<0)<<31>>31|0)|0;c=~~(+(c|0)-(+(l>>>0)+4294967296.0*+(Z()|0))*2.0);f[b>>2]=c;break}else{l=(a+1|0)/2|0;l=Uc(c|0,((c|0)<0)<<31>>31|0,l|0,((l|0)<0)<<31>>31|0)|0;c=~~(+(c|0)-((+(l>>>0)+4294967296.0*+(Z()|0))*2.0+1.0));f[b>>2]=c;break}while(0);l=b+4|0;if(k<0.0){c=c-((a<<1|1|0)/2|0)|0;f[b>>2]=c;a=0-a|0;f[l>>2]=a}d=a-c|0;if((c|0)<0){e=0-c|0;f[l>>2]=d;f[m>>2]=e;f[b>>2]=0;a=d;c=0}else e=0;if((a|0)<0){c=c-a|0;f[b>>2]=c;e=e-a|0;f[m>>2]=e;f[l>>2]=0;a=0}g=c-e|0;d=a-e|0;if((e|0)<0){f[b>>2]=g;f[l>>2]=d;f[m>>2]=0;a=d;c=g;e=0}d=(a|0)<(c|0)?a:c;d=(e|0)<(d|0)?e:d;if((d|0)<=0)return;f[b>>2]=c-d;f[l>>2]=a-d;f[m>>2]=e-d;return}function Na(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0;b=f[a>>2]|0;h=a+4|0;c=f[h>>2]|0;if((b|0)<0){c=c-b|0;f[h>>2]=c;g=a+8|0;f[g>>2]=(f[g>>2]|0)-b;f[a>>2]=0;b=0}if((c|0)<0){b=b-c|0;f[a>>2]=b;g=a+8|0;e=(f[g>>2]|0)-c|0;f[g>>2]=e;f[h>>2]=0;c=0}else{e=a+8|0;g=e;e=f[e>>2]|0}if((e|0)<0){b=b-e|0;f[a>>2]=b;c=c-e|0;f[h>>2]=c;f[g>>2]=0;e=0}d=(c|0)<(b|0)?c:b;d=(e|0)<(d|0)?e:d;if((d|0)<=0)return;f[a>>2]=b-d;f[h>>2]=c-d;f[g>>2]=e-d;return}function Oa(a,b){a=a|0;b=b|0;var c=0.0,d=0;d=f[a+8>>2]|0;c=+((f[a+4>>2]|0)-d|0);p[b>>3]=+((f[a>>2]|0)-d|0)-c*.5;p[b+8>>3]=c*.8660254037844386;return}function Pa(a,b,c){a=a|0;b=b|0;c=c|0;f[c>>2]=(f[b>>2]|0)+(f[a>>2]|0);f[c+4>>2]=(f[b+4>>2]|0)+(f[a+4>>2]|0);f[c+8>>2]=(f[b+8>>2]|0)+(f[a+8>>2]|0);return}function Qa(a,b,c){a=a|0;b=b|0;c=c|0;f[c>>2]=(f[a>>2]|0)-(f[b>>2]|0);f[c+4>>2]=(f[a+4>>2]|0)-(f[b+4>>2]|0);f[c+8>>2]=(f[a+8>>2]|0)-(f[b+8>>2]|0);return}function Ra(a,b){a=a|0;b=b|0;var c=0,d=0;c=S(f[a>>2]|0,b)|0;f[a>>2]=c;c=a+4|0;d=S(f[c>>2]|0,b)|0;f[c>>2]=d;a=a+8|0;b=S(f[a>>2]|0,b)|0;f[a>>2]=b;return}function Sa(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0;h=f[a>>2]|0;i=(h|0)<0;d=(f[a+4>>2]|0)-(i?h:0)|0;g=(d|0)<0;e=(g?0-d|0:0)+((f[a+8>>2]|0)-(i?h:0))|0;c=(e|0)<0;a=c?0:e;b=(g?0:d)-(c?e:0)|0;e=(i?0:h)-(g?d:0)-(c?e:0)|0;c=(b|0)<(e|0)?b:e;c=(a|0)<(c|0)?a:c;d=(c|0)>0;a=a-(d?c:0)|0;b=b-(d?c:0)|0;a:do switch(e-(d?c:0)|0){case 0:switch(b|0){case 0:{i=(a|0)==0?0:(a|0)==1?1:7;return i|0}case 1:{i=(a|0)==0?2:(a|0)==1?3:7;return i|0}default:break a}case 1:switch(b|0){case 0:{i=(a|0)==0?4:(a|0)==1?5:7;return i|0}case 1:{if(!a)a=6;else break a;return a|0}default:break a}default:{}}while(0);i=7;return i|0}function Ta(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0;h=a+8|0;c=f[h>>2]|0;b=(f[a>>2]|0)-c|0;i=a+4|0;c=(f[i>>2]|0)-c|0;d=Sc(+((b*3|0)-c|0)/7.0)|0;f[a>>2]=d;b=Sc(+((c<<1)+b|0)/7.0)|0;f[i>>2]=b;f[h>>2]=0;c=b-d|0;if((d|0)<0){g=0-d|0;f[i>>2]=c;f[h>>2]=g;f[a>>2]=0;b=c;d=0;c=g}else c=0;if((b|0)<0){d=d-b|0;f[a>>2]=d;c=c-b|0;f[h>>2]=c;f[i>>2]=0;b=0}g=d-c|0;e=b-c|0;if((c|0)<0){f[a>>2]=g;f[i>>2]=e;f[h>>2]=0;b=e;e=g;c=0}else e=d;d=(b|0)<(e|0)?b:e;d=(c|0)<(d|0)?c:d;if((d|0)<=0)return;f[a>>2]=e-d;f[i>>2]=b-d;f[h>>2]=c-d;return}function Ua(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0;h=a+8|0;c=f[h>>2]|0;b=(f[a>>2]|0)-c|0;i=a+4|0;c=(f[i>>2]|0)-c|0;d=Sc(+((b<<1)+c|0)/7.0)|0;f[a>>2]=d;b=Sc(+((c*3|0)-b|0)/7.0)|0;f[i>>2]=b;f[h>>2]=0;c=b-d|0;if((d|0)<0){g=0-d|0;f[i>>2]=c;f[h>>2]=g;f[a>>2]=0;b=c;d=0;c=g}else c=0;if((b|0)<0){d=d-b|0;f[a>>2]=d;c=c-b|0;f[h>>2]=c;f[i>>2]=0;b=0}g=d-c|0;e=b-c|0;if((c|0)<0){f[a>>2]=g;f[i>>2]=e;f[h>>2]=0;b=e;e=g;c=0}else e=d;d=(b|0)<(e|0)?b:e;d=(c|0)<(d|0)?c:d;if((d|0)<=0)return;f[a>>2]=e-d;f[i>>2]=b-d;f[h>>2]=c-d;return}function Va(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0;b=f[a>>2]|0;h=a+4|0;c=f[h>>2]|0;i=a+8|0;d=f[i>>2]|0;e=c+(b*3|0)|0;f[a>>2]=e;c=d+(c*3|0)|0;f[h>>2]=c;b=(d*3|0)+b|0;f[i>>2]=b;d=c-e|0;if((e|0)<0){b=b-e|0;f[h>>2]=d;f[i>>2]=b;f[a>>2]=0;c=d;d=0}else d=e;if((c|0)<0){d=d-c|0;f[a>>2]=d;b=b-c|0;f[i>>2]=b;f[h>>2]=0;c=0}g=d-b|0;e=c-b|0;if((b|0)<0){f[a>>2]=g;f[h>>2]=e;f[i>>2]=0;d=g;b=0}else e=c;c=(e|0)<(d|0)?e:d;c=(b|0)<(c|0)?b:c;if((c|0)<=0)return;f[a>>2]=d-c;f[h>>2]=e-c;f[i>>2]=b-c;return}function Wa(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0;e=f[a>>2]|0;h=a+4|0;b=f[h>>2]|0;i=a+8|0;c=f[i>>2]|0;d=(b*3|0)+e|0;e=c+(e*3|0)|0;f[a>>2]=e;f[h>>2]=d;b=(c*3|0)+b|0;f[i>>2]=b;c=d-e|0;if((e|0)<0){b=b-e|0;f[h>>2]=c;f[i>>2]=b;f[a>>2]=0;e=0}else c=d;if((c|0)<0){e=e-c|0;f[a>>2]=e;b=b-c|0;f[i>>2]=b;f[h>>2]=0;c=0}g=e-b|0;d=c-b|0;if((b|0)<0){f[a>>2]=g;f[h>>2]=d;f[i>>2]=0;e=g;b=0}else d=c;c=(d|0)<(e|0)?d:e;c=(b|0)<(c|0)?b:c;if((c|0)<=0)return;f[a>>2]=e-c;f[h>>2]=d-c;f[i>>2]=b-c;return}function Xa(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0;if((b+-1|0)>>>0>=6)return;e=(f[15472+(b*12|0)>>2]|0)+(f[a>>2]|0)|0;f[a>>2]=e;i=a+4|0;d=(f[15472+(b*12|0)+4>>2]|0)+(f[i>>2]|0)|0;f[i>>2]=d;h=a+8|0;b=(f[15472+(b*12|0)+8>>2]|0)+(f[h>>2]|0)|0;f[h>>2]=b;c=d-e|0;if((e|0)<0){b=b-e|0;f[i>>2]=c;f[h>>2]=b;f[a>>2]=0;d=0}else{c=d;d=e}if((c|0)<0){d=d-c|0;f[a>>2]=d;b=b-c|0;f[h>>2]=b;f[i>>2]=0;c=0}g=d-b|0;e=c-b|0;if((b|0)<0){f[a>>2]=g;f[i>>2]=e;f[h>>2]=0;d=g;b=0}else e=c;c=(e|0)<(d|0)?e:d;c=(b|0)<(c|0)?b:c;if((c|0)<=0)return;f[a>>2]=d-c;f[i>>2]=e-c;f[h>>2]=b-c;return}function Ya(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0;e=f[a>>2]|0;h=a+4|0;b=f[h>>2]|0;i=a+8|0;c=f[i>>2]|0;d=b+e|0;e=c+e|0;f[a>>2]=e;f[h>>2]=d;b=c+b|0;f[i>>2]=b;c=d-e|0;if((e|0)<0){b=b-e|0;f[h>>2]=c;f[i>>2]=b;f[a>>2]=0;d=0}else{c=d;d=e}if((c|0)<0){d=d-c|0;f[a>>2]=d;b=b-c|0;f[i>>2]=b;f[h>>2]=0;c=0}g=d-b|0;e=c-b|0;if((b|0)<0){f[a>>2]=g;f[h>>2]=e;f[i>>2]=0;d=g;b=0}else e=c;c=(e|0)<(d|0)?e:d;c=(b|0)<(c|0)?b:c;if((c|0)<=0)return;f[a>>2]=d-c;f[h>>2]=e-c;f[i>>2]=b-c;return}function Za(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0;b=f[a>>2]|0;h=a+4|0;d=f[h>>2]|0;i=a+8|0;c=f[i>>2]|0;e=d+b|0;f[a>>2]=e;d=c+d|0;f[h>>2]=d;b=c+b|0;f[i>>2]=b;c=d-e|0;if((e|0)<0){b=b-e|0;f[h>>2]=c;f[i>>2]=b;f[a>>2]=0;d=0}else{c=d;d=e}if((c|0)<0){d=d-c|0;f[a>>2]=d;b=b-c|0;f[i>>2]=b;f[h>>2]=0;c=0}g=d-b|0;e=c-b|0;if((b|0)<0){f[a>>2]=g;f[h>>2]=e;f[i>>2]=0;d=g;b=0}else e=c;c=(e|0)<(d|0)?e:d;c=(b|0)<(c|0)?b:c;if((c|0)<=0)return;f[a>>2]=d-c;f[h>>2]=e-c;f[i>>2]=b-c;return}function _a(a){a=a|0;switch(a|0){case 1:{a=5;break}case 5:{a=4;break}case 4:{a=6;break}case 6:{a=2;break}case 2:{a=3;break}case 3:{a=1;break}default:{}}return a|0}function $a(a){a=a|0;switch(a|0){case 1:{a=3;break}case 3:{a=2;break}case 2:{a=6;break}case 6:{a=4;break}case 4:{a=5;break}case 5:{a=1;break}default:{}}return a|0}function ab(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0;b=f[a>>2]|0;h=a+4|0;c=f[h>>2]|0;i=a+8|0;d=f[i>>2]|0;e=c+(b<<1)|0;f[a>>2]=e;c=d+(c<<1)|0;f[h>>2]=c;b=(d<<1)+b|0;f[i>>2]=b;d=c-e|0;if((e|0)<0){b=b-e|0;f[h>>2]=d;f[i>>2]=b;f[a>>2]=0;c=d;d=0}else d=e;if((c|0)<0){d=d-c|0;f[a>>2]=d;b=b-c|0;f[i>>2]=b;f[h>>2]=0;c=0}g=d-b|0;e=c-b|0;if((b|0)<0){f[a>>2]=g;f[h>>2]=e;f[i>>2]=0;d=g;b=0}else e=c;c=(e|0)<(d|0)?e:d;c=(b|0)<(c|0)?b:c;if((c|0)<=0)return;f[a>>2]=d-c;f[h>>2]=e-c;f[i>>2]=b-c;return}function bb(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0;e=f[a>>2]|0;h=a+4|0;b=f[h>>2]|0;i=a+8|0;c=f[i>>2]|0;d=(b<<1)+e|0;e=c+(e<<1)|0;f[a>>2]=e;f[h>>2]=d;b=(c<<1)+b|0;f[i>>2]=b;c=d-e|0;if((e|0)<0){b=b-e|0;f[h>>2]=c;f[i>>2]=b;f[a>>2]=0;e=0}else c=d;if((c|0)<0){e=e-c|0;f[a>>2]=e;b=b-c|0;f[i>>2]=b;f[h>>2]=0;c=0}g=e-b|0;d=c-b|0;if((b|0)<0){f[a>>2]=g;f[h>>2]=d;f[i>>2]=0;e=g;b=0}else d=c;c=(d|0)<(e|0)?d:e;c=(b|0)<(c|0)?b:c;if((c|0)<=0)return;f[a>>2]=e-c;f[h>>2]=d-c;f[i>>2]=b-c;return}function cb(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0;h=(f[a>>2]|0)-(f[b>>2]|0)|0;i=(h|0)<0;d=(f[a+4>>2]|0)-(f[b+4>>2]|0)-(i?h:0)|0;g=(d|0)<0;e=(i?0-h|0:0)+(f[a+8>>2]|0)-(f[b+8>>2]|0)+(g?0-d|0:0)|0;a=(e|0)<0;b=a?0:e;c=(g?0:d)-(a?e:0)|0;e=(i?0:h)-(g?d:0)-(a?e:0)|0;a=(c|0)<(e|0)?c:e;a=(b|0)<(a|0)?b:a;d=(a|0)>0;b=b-(d?a:0)|0;c=c-(d?a:0)|0;a=e-(d?a:0)|0;a=(a|0)>-1?a:0-a|0;c=(c|0)>-1?c:0-c|0;b=(b|0)>-1?b:0-b|0;b=(c|0)>(b|0)?c:b;return ((a|0)>(b|0)?a:b)|0}function db(a,b){a=a|0;b=b|0;var c=0;c=f[a+8>>2]|0;f[b>>2]=(f[a>>2]|0)-c;f[b+4>>2]=(f[a+4>>2]|0)-c;return}function eb(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0;d=f[a>>2]|0;f[b>>2]=d;a=f[a+4>>2]|0;h=b+4|0;f[h>>2]=a;i=b+8|0;f[i>>2]=0;c=a-d|0;if((d|0)<0){a=0-d|0;f[h>>2]=c;f[i>>2]=a;f[b>>2]=0;d=0}else{c=a;a=0}if((c|0)<0){d=d-c|0;f[b>>2]=d;a=a-c|0;f[i>>2]=a;f[h>>2]=0;c=0}g=d-a|0;e=c-a|0;if((a|0)<0){f[b>>2]=g;f[h>>2]=e;f[i>>2]=0;c=e;e=g;a=0}else e=d;d=(c|0)<(e|0)?c:e;d=(a|0)<(d|0)?a:d;if((d|0)<=0)return;f[b>>2]=e-d;f[h>>2]=c-d;f[i>>2]=a-d;return}function fb(a){a=a|0;var b=0,c=0,d=0,e=0;b=a+8|0;e=f[b>>2]|0;c=e-(f[a>>2]|0)|0;f[a>>2]=c;d=a+4|0;a=(f[d>>2]|0)-e|0;f[d>>2]=a;f[b>>2]=0-(a+c);return}function gb(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0;c=f[a>>2]|0;b=0-c|0;f[a>>2]=b;h=a+8|0;f[h>>2]=0;i=a+4|0;d=f[i>>2]|0;e=d+c|0;if((c|0)>0){f[i>>2]=e;f[h>>2]=c;f[a>>2]=0;b=0;d=e}else c=0;if((d|0)<0){g=b-d|0;f[a>>2]=g;c=c-d|0;f[h>>2]=c;f[i>>2]=0;e=g-c|0;b=0-c|0;if((c|0)<0){f[a>>2]=e;f[i>>2]=b;f[h>>2]=0;d=b;c=0}else{d=0;e=g}}else e=b;b=(d|0)<(e|0)?d:e;b=(c|0)<(b|0)?c:b;if((b|0)<=0)return;f[a>>2]=e-b;f[i>>2]=d-b;f[h>>2]=c-b;return}function hb(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=ea;ea=ea+16|0;e=d;ib(a,b,c,e);Ma(e,c+4|0);ea=d;return}function ib(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0.0,g=0,h=0.0,i=0.0,j=0;j=ea;ea=ea+32|0;g=j;Fc(a,g);f[c>>2]=0;e=+Ec(15888,g);h=+Ec(15912,g);if(h<e){f[c>>2]=1;e=h}h=+Ec(15936,g);if(h<e){f[c>>2]=2;e=h}h=+Ec(15960,g);if(h<e){f[c>>2]=3;e=h}h=+Ec(15984,g);if(h<e){f[c>>2]=4;e=h}h=+Ec(16008,g);if(h<e){f[c>>2]=5;e=h}h=+Ec(16032,g);if(h<e){f[c>>2]=6;e=h}h=+Ec(16056,g);if(h<e){f[c>>2]=7;e=h}h=+Ec(16080,g);if(h<e){f[c>>2]=8;e=h}h=+Ec(16104,g);if(h<e){f[c>>2]=9;e=h}h=+Ec(16128,g);if(h<e){f[c>>2]=10;e=h}h=+Ec(16152,g);if(h<e){f[c>>2]=11;e=h}h=+Ec(16176,g);if(h<e){f[c>>2]=12;e=h}h=+Ec(16200,g);if(h<e){f[c>>2]=13;e=h}h=+Ec(16224,g);if(h<e){f[c>>2]=14;e=h}h=+Ec(16248,g);if(h<e){f[c>>2]=15;e=h}h=+Ec(16272,g);if(h<e){f[c>>2]=16;e=h}h=+Ec(16296,g);if(h<e){f[c>>2]=17;e=h}h=+Ec(16320,g);if(h<e){f[c>>2]=18;e=h}h=+Ec(16344,g);if(h<e){f[c>>2]=19;e=h}h=+L(+(1.0-e*.5));if(h<1.0e-16){f[d>>2]=0;f[d+4>>2]=0;f[d+8>>2]=0;f[d+12>>2]=0;ea=j;return}c=f[c>>2]|0;e=+p[16368+(c*24|0)>>3];e=+ob(e-+ob(+ub(15568+(c<<4)|0,a)));if(!(Rb(b)|0))i=e;else i=+ob(e+-.3334731722518321);e=+K(+h)/.381966011250105;if((b|0)>0){g=0;do{e=e*2.6457513110645907;g=g+1|0}while((g|0)!=(b|0))}h=+I(+i)*e;p[d>>3]=h;i=+J(+i)*e;p[d+8>>3]=i;ea=j;return}function jb(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var g=0.0,h=0.0;g=+Bc(a);if(g<1.0e-16){b=15568+(b<<4)|0;f[e>>2]=f[b>>2];f[e+4>>2]=f[b+4>>2];f[e+8>>2]=f[b+8>>2];f[e+12>>2]=f[b+12>>2];return}h=+O(+(+p[a+8>>3]),+(+p[a>>3]));if((c|0)>0){a=0;do{g=g/2.6457513110645907;a=a+1|0}while((a|0)!=(c|0))}if(!d){g=+N(+(g*.381966011250105));if(Rb(c)|0)h=+ob(h+.3334731722518321)}else{g=g/3.0;c=(Rb(c)|0)==0;g=+N(+((c?g:g/2.6457513110645907)*.381966011250105))}vb(15568+(b<<4)|0,+ob(+p[16368+(b*24|0)>>3]-h),g,e);return}function kb(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=ea;ea=ea+16|0;e=d;Oa(a+4|0,e);jb(e,f[a>>2]|0,b,0,c);ea=d;return}function lb(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0.0,F=0.0;D=ea;ea=ea+384|0;d=D+144|0;e=D+80|0;j=D+368|0;z=D;A=D+352|0;B=D+336|0;C=D+304|0;s=D+288|0;t=D+320|0;u=D+272|0;v=D+256|0;w=D+240|0;x=D+224|0;y=D+208|0;g=d;h=16848;i=g+60|0;do{f[g>>2]=f[h>>2];g=g+4|0;h=h+4|0}while((g|0)<(i|0));g=e;h=16912;i=g+60|0;do{f[g>>2]=f[h>>2];g=g+4|0;h=h+4|0}while((g|0)<(i|0));r=(Rb(b)|0)==0;e=r?d:e;f[j>>2]=f[a>>2];f[j+4>>2]=f[a+4>>2];f[j+8>>2]=f[a+8>>2];f[j+12>>2]=f[a+12>>2];d=j+4|0;ab(d);bb(d);if(!(Rb(b)|0))r=b;else{Wa(d);r=b+1|0}f[z>>2]=f[j>>2];a=z+4|0;Pa(d,e,a);Na(a);f[z+16>>2]=f[j>>2];a=z+20|0;Pa(d,e+12|0,a);Na(a);f[z+32>>2]=f[j>>2];a=z+36|0;Pa(d,e+24|0,a);Na(a);f[z+48>>2]=f[j>>2];a=z+52|0;Pa(d,e+36|0,a);Na(a);f[z+64>>2]=f[j>>2];a=z+68|0;Pa(d,e+48|0,a);Na(a);f[c>>2]=0;a=A+4|0;j=C+4|0;k=16976+(r<<2)|0;l=17056+(r<<2)|0;m=v+8|0;n=w+8|0;o=x+8|0;q=B+4|0;i=0;a:while(1){h=z+(((i>>>0)%5|0)<<4)|0;f[B>>2]=f[h>>2];f[B+4>>2]=f[h+4>>2];f[B+8>>2]=f[h+8>>2];f[B+12>>2]=f[h+12>>2];if((mb(B,r,0,1)|0)==2)do{}while((mb(B,r,0,1)|0)==2);if((i|0)!=0&(Rb(b)|0)!=0){f[C>>2]=f[B>>2];f[C+4>>2]=f[B+4>>2];f[C+8>>2]=f[B+8>>2];f[C+12>>2]=f[B+12>>2];Oa(a,s);e=f[C>>2]|0;g=f[17136+(e*80|0)+(f[A>>2]<<2)>>2]|0;f[C>>2]=f[18736+(e*80|0)+(g*20|0)>>2];h=f[18736+(e*80|0)+(g*20|0)+16>>2]|0;if((h|0)>0){d=0;do{Ya(j);d=d+1|0}while((d|0)<(h|0))}h=18736+(e*80|0)+(g*20|0)+4|0;f[t>>2]=f[h>>2];f[t+4>>2]=f[h+4>>2];f[t+8>>2]=f[h+8>>2];Ra(t,(f[k>>2]|0)*3|0);Pa(j,t,j);Na(j);Oa(j,u);E=+(f[l>>2]|0);p[v>>3]=E*3.0;p[m>>3]=0.0;F=E*-1.5;p[w>>3]=F;p[n>>3]=E*2.598076211353316;p[x>>3]=F;p[o>>3]=E*-2.598076211353316;switch(f[17136+((f[C>>2]|0)*80|0)+(f[B>>2]<<2)>>2]|0){case 1:{d=w;e=v;break}case 3:{d=x;e=w;break}case 2:{d=v;e=x;break}default:{d=14;break a}}Cc(s,u,e,d,y);jb(y,f[C>>2]|0,r,1,c+8+(f[c>>2]<<4)|0);f[c>>2]=(f[c>>2]|0)+1}if(i>>>0<5){Oa(q,C);jb(C,f[B>>2]|0,r,1,c+8+(f[c>>2]<<4)|0);f[c>>2]=(f[c>>2]|0)+1};f[A>>2]=f[B>>2];f[A+4>>2]=f[B+4>>2];f[A+8>>2]=f[B+8>>2];f[A+12>>2]=f[B+12>>2];i=i+1|0;if(i>>>0>=6){d=4;break}}if((d|0)==4){ea=D;return}else if((d|0)==14)$(22177,22224,630,22234)}function mb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;p=ea;ea=ea+32|0;n=p+12|0;i=p;o=a+4|0;m=f[17056+(b<<2)>>2]|0;l=(d|0)!=0;m=l?m*3|0:m;e=f[o>>2]|0;k=a+8|0;h=f[k>>2]|0;if(l){g=a+12|0;d=f[g>>2]|0;e=h+e+d|0;if((e|0)==(m|0)){o=1;ea=p;return o|0}else j=g}else{j=a+12|0;d=f[j>>2]|0;e=h+e+d|0}if((e|0)<=(m|0)){o=0;ea=p;return o|0}do if((d|0)>0){d=f[a>>2]|0;if((h|0)>0){g=18736+(d*80|0)+60|0;d=a;break}d=18736+(d*80|0)+40|0;if(!c){g=d;d=a}else{La(n,m,0,0);Qa(o,n,i);Za(i);Pa(i,n,o);g=d;d=a}}else{g=18736+((f[a>>2]|0)*80|0)+20|0;d=a}while(0);f[d>>2]=f[g>>2];e=g+16|0;if((f[e>>2]|0)>0){d=0;do{Ya(o);d=d+1|0}while((d|0)<(f[e>>2]|0))}a=g+4|0;f[n>>2]=f[a>>2];f[n+4>>2]=f[a+4>>2];f[n+8>>2]=f[a+8>>2];b=f[16976+(b<<2)>>2]|0;Ra(n,l?b*3|0:b);Pa(o,n,o);Na(o);if(l)d=((f[k>>2]|0)+(f[o>>2]|0)+(f[j>>2]|0)|0)==(m|0)?1:2;else d=2;o=d;ea=p;return o|0}function nb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0.0,B=0.0;z=ea;ea=ea+384|0;h=z+176|0;i=z+96|0;u=z+360|0;v=z;w=z+344|0;x=z+328|0;o=z+312|0;q=z+296|0;r=z+280|0;s=z+264|0;t=z+248|0;if(c|0){lb(a,b,d);ea=z;return}c=h;e=20336;g=c+72|0;do{f[c>>2]=f[e>>2];c=c+4|0;e=e+4|0}while((c|0)<(g|0));c=i;e=20416;g=c+72|0;do{f[c>>2]=f[e>>2];c=c+4|0;e=e+4|0}while((c|0)<(g|0));e=(Rb(b)|0)==0;e=e?h:i;f[u>>2]=f[a>>2];f[u+4>>2]=f[a+4>>2];f[u+8>>2]=f[a+8>>2];f[u+12>>2]=f[a+12>>2];c=u+4|0;ab(c);bb(c);if(!(Rb(b)|0))n=b;else{Wa(c);n=b+1|0}f[v>>2]=f[u>>2];a=v+4|0;Pa(c,e,a);Na(a);f[v+16>>2]=f[u>>2];a=v+20|0;Pa(c,e+12|0,a);Na(a);f[v+32>>2]=f[u>>2];a=v+36|0;Pa(c,e+24|0,a);Na(a);f[v+48>>2]=f[u>>2];a=v+52|0;Pa(c,e+36|0,a);Na(a);f[v+64>>2]=f[u>>2];a=v+68|0;Pa(c,e+48|0,a);Na(a);f[v+80>>2]=f[u>>2];a=v+84|0;Pa(c,e+60|0,a);Na(a);f[d>>2]=0;a=17056+(n<<2)|0;j=q+8|0;k=r+8|0;l=s+8|0;m=w+4|0;c=-1;h=0;i=0;a:while(1){g=(i>>>0)%6|0;e=v+(g<<4)|0;f[w>>2]=f[e>>2];f[w+4>>2]=f[e+4>>2];f[w+8>>2]=f[e+8>>2];f[w+12>>2]=f[e+12>>2];e=h;h=mb(w,n,0,1)|0;if((i|0)!=0&(Rb(b)|0)!=0?((e|0)!=1?(f[w>>2]|0)!=(c|0):0):0){Oa(v+((((g+5|0)>>>0)%6|0)<<4)+4|0,x);Oa(v+(g<<4)+4|0,o);A=+(f[a>>2]|0);p[q>>3]=A*3.0;p[j>>3]=0.0;B=A*-1.5;p[r>>3]=B;p[k>>3]=A*2.598076211353316;p[s>>3]=B;p[l>>3]=A*-2.598076211353316;g=f[u>>2]|0;switch(f[17136+(g*80|0)+(((c|0)==(g|0)?f[w>>2]|0:c)<<2)>>2]|0){case 1:{c=r;e=q;break}case 3:{c=s;e=r;break}case 2:{c=q;e=s;break}default:{y=11;break a}}Cc(x,o,e,c,t);if(!(Dc(x,t)|0)?!(Dc(o,t)|0):0){jb(t,f[u>>2]|0,n,1,d+8+(f[d>>2]<<4)|0);f[d>>2]=(f[d>>2]|0)+1}}if(i>>>0<6){Oa(m,x);jb(x,f[w>>2]|0,n,1,d+8+(f[d>>2]<<4)|0);f[d>>2]=(f[d>>2]|0)+1}i=i+1|0;if(i>>>0>=7)break;else c=f[w>>2]|0}if((y|0)==11)$(22260,22224,784,22305);ea=z;return}function ob(a){a=+a;var b=0.0;b=a<0.0?a+6.283185307179586:a;return +(!(a>=6.283185307179586)?b:b+-6.283185307179586)}function pb(a,b,c){a=a|0;b=b|0;c=+c;if(!(+F(+(+p[a>>3]-+p[b>>3]))<c)){b=0;return b|0}b=+F(+(+p[a+8>>3]-+p[b+8>>3]))<c;return b|0}function qb(a,b){a=a|0;b=b|0;if(!(+F(+(+p[a>>3]-+p[b>>3]))<1.7453292519943298e-11)){b=0;return b|0}b=+F(+(+p[a+8>>3]-+p[b+8>>3]))<1.7453292519943298e-11;return b|0}function rb(a){a=+a;if(!(a>1.5707963267948966))return +a;do a=a+-3.141592653589793;while(a>1.5707963267948966);return +a}function sb(a){a=+a;if(a>3.141592653589793)do a=a+-6.283185307179586;while(a>3.141592653589793);if(!(a<-3.141592653589793))return +a;do a=a+6.283185307179586;while(a<-3.141592653589793);return +a}function tb(a,b){a=a|0;b=b|0;var c=0.0,d=0.0,e=0.0;d=+p[b+8>>3];e=+p[a+8>>3];c=+F(+(d-e));if(c>3.141592653589793)c=+F(+((d<0.0?d+6.283185307179586:d)-(e<0.0?e+6.283185307179586:e)));d=1.5707963267948966-+p[a>>3];e=1.5707963267948966-+p[b>>3];e=+I(+d)*+I(+e)+ +I(+c)*(+J(+d)*+J(+e));e=e>1.0?1.0:e;return +(+L(+(e<-1.0?-1.0:e))*6371.007180918475)}function ub(a,b){a=a|0;b=b|0;var c=0.0,d=0.0,e=0.0,f=0.0,g=0.0;f=+p[b>>3];d=+I(+f);e=+p[b+8>>3]-+p[a+8>>3];g=d*+J(+e);c=+p[a>>3];return +(+O(+g,+(+J(+f)*+I(+c)-+I(+e)*(d*+J(+c)))))}function vb(a,b,c,d){a=a|0;b=+b;c=+c;d=d|0;var e=0,g=0.0,h=0.0,i=0.0;if(c<1.0e-16){f[d>>2]=f[a>>2];f[d+4>>2]=f[a+4>>2];f[d+8>>2]=f[a+8>>2];f[d+12>>2]=f[a+12>>2];return}g=b<0.0?b+6.283185307179586:b;g=!(b>=6.283185307179586)?g:g+-6.283185307179586;do if(g<1.0e-16){b=+p[a>>3]+c;p[d>>3]=b;e=d}else{e=+F(+(g+-3.141592653589793))<1.0e-16;b=+p[a>>3];if(e){b=b-c;p[d>>3]=b;e=d;break}h=+I(+c);c=+J(+c);b=h*+J(+b)+ +I(+g)*(c*+I(+b));b=b>1.0?1.0:b;b=+M(+(b<-1.0?-1.0:b));p[d>>3]=b;if(+F(+(b+-1.5707963267948966))<1.0e-16){p[d>>3]=1.5707963267948966;p[d+8>>3]=0.0;return}if(+F(+(b+1.5707963267948966))<1.0e-16){p[d>>3]=-1.5707963267948966;p[d+8>>3]=0.0;return}i=+I(+b);g=c*+J(+g)/i;c=+p[a>>3];b=(h-+J(+b)*+J(+c))/+I(+c)/i;h=g>1.0?1.0:g;b=+p[a+8>>3]+ +O(+(b<-1.0?-1.0:b>1.0?1.0:h<-1.0?-1.0:h),+b);if(b>3.141592653589793)do b=b+-6.283185307179586;while(b>3.141592653589793);if(b<-3.141592653589793)do b=b+6.283185307179586;while(b<-3.141592653589793);p[d+8>>3]=b;return}while(0);if(+F(+(b+-1.5707963267948966))<1.0e-16){p[e>>3]=1.5707963267948966;p[d+8>>3]=0.0;return}if(+F(+(b+1.5707963267948966))<1.0e-16){p[e>>3]=-1.5707963267948966;p[d+8>>3]=0.0;return}b=+p[a+8>>3];if(b>3.141592653589793)do b=b+-6.283185307179586;while(b>3.141592653589793);if(b<-3.141592653589793)do b=b+6.283185307179586;while(b<-3.141592653589793);p[d+8>>3]=b;return}function wb(a){a=a|0;return +(+p[20496+(a<<3)>>3])}function xb(a){a=a|0;return +(+p[20624+(a<<3)>>3])}function yb(a){a=a|0;return +(+p[20752+(a<<3)>>3])}function zb(a){a=a|0;return +(+p[20880+(a<<3)>>3])}function Ab(a){a=a|0;var b=0;b=21008+(a<<3)|0;a=f[b>>2]|0;Y(f[b+4>>2]|0);return a|0}function Bb(a,b){a=a|0;b=b|0;b=Yc(a|0,b|0,45)|0;Z()|0;return b&127|0}function Cb(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0;if(!(0==0&(b&2013265920|0)==134217728)){b=0;return b|0}g=Yc(a|0,b|0,45)|0;Z()|0;g=g&127;if(g>>>0>121){b=0;return b|0}c=Yc(a|0,b|0,52)|0;Z()|0;c=c&15;do if(c|0){e=1;d=0;while(1){f=Yc(a|0,b|0,(15-e|0)*3|0)|0;Z()|0;f=f&7;if((f|0)!=0&(d^1))if((f|0)==1&(ya(g)|0)!=0){h=0;d=13;break}else d=1;if((f|0)==7){h=0;d=13;break}if(e>>>0<c>>>0)e=e+1|0;else{d=9;break}}if((d|0)==9){if((c|0)==15)h=1;else break;return h|0}else if((d|0)==13)return h|0}while(0);while(1){h=Yc(a|0,b|0,(14-c|0)*3|0)|0;Z()|0;if(!((h&7|0)==7&0==0)){h=0;d=13;break}if(c>>>0<14)c=c+1|0;else{h=1;d=13;break}}if((d|0)==13)return h|0;return 0}function Db(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=Yc(a|0,b|0,52)|0;Z()|0;d=d&15;if((d|0)>=(c|0)){if((d|0)!=(c|0))if(c>>>0<=15){e=Zc(c|0,0,52)|0;a=e|a;b=Z()|0|b&-15728641;if((d|0)>(c|0))do{e=Zc(7,0,(14-c|0)*3|0)|0;c=c+1|0;a=e|a;b=Z()|0|b}while((c|0)<(d|0))}else{b=0;a=0}}else{b=0;a=0}Y(b|0);return a|0}function Eb(a,b,c){a=a|0;b=b|0;c=c|0;a=Yc(a|0,b|0,52)|0;Z()|0;a=a&15;if((a|0)>(c|0)){c=0;return c|0}c=pc(7,c-a|0)|0;return c|0}function Fb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0;h=Yc(a|0,b|0,52)|0;Z()|0;h=h&15;if((h|0)>(c|0))return;if((h|0)==(c|0)){c=d;f[c>>2]=a;f[c+4>>2]=b;return}j=pc(7,c-h|0)|0;k=(j|0)/7|0;i=Yc(a|0,b|0,45)|0;Z()|0;if(!(ya(i&127)|0))g=0;else{a:do if(!h)e=0;else{g=1;while(1){e=Yc(a|0,b|0,(15-g|0)*3|0)|0;Z()|0;e=e&7;if(e|0)break a;if(g>>>0<h>>>0)g=g+1|0;else{e=0;break}}}while(0);g=(e|0)==0}l=Zc(h+1|0,0,52)|0;e=Z()|0|b&-15728641;i=(14-h|0)*3|0;b=Zc(7,0,i|0)|0;b=(l|a)&~b;h=e&~(Z()|0);Fb(b,h,c,d);e=d+(k<<3)|0;if(!g){l=Zc(1,0,i|0)|0;Fb(l|b,Z()|0|h,c,e);l=e+(k<<3)|0;j=Zc(2,0,i|0)|0;Fb(j|b,Z()|0|h,c,l);l=l+(k<<3)|0;j=Zc(3,0,i|0)|0;Fb(j|b,Z()|0|h,c,l);l=l+(k<<3)|0;j=Zc(4,0,i|0)|0;Fb(j|b,Z()|0|h,c,l);l=l+(k<<3)|0;j=Zc(5,0,i|0)|0;Fb(j|b,Z()|0|h,c,l);j=Zc(6,0,i|0)|0;Fb(j|b,Z()|0|h,c,l+(k<<3)|0);return}g=e+(k<<3)|0;if((j|0)>6){j=e+8|0;l=(g>>>0>j>>>0?g:j)+-1+(0-e)|0;ad(e|0,0,l+8&-8|0)|0;e=j+(l>>>3<<3)|0}l=Zc(2,0,i|0)|0;Fb(l|b,Z()|0|h,c,e);l=e+(k<<3)|0;j=Zc(3,0,i|0)|0;Fb(j|b,Z()|0|h,c,l);l=l+(k<<3)|0;j=Zc(4,0,i|0)|0;Fb(j|b,Z()|0|h,c,l);l=l+(k<<3)|0;j=Zc(5,0,i|0)|0;Fb(j|b,Z()|0|h,c,l);j=Zc(6,0,i|0)|0;Fb(j|b,Z()|0|h,c,l+(k<<3)|0);return}function Gb(a,b){a=a|0;b=b|0;var c=0,d=0,e=0;e=Yc(a|0,b|0,45)|0;Z()|0;if(!(ya(e&127)|0)){e=0;return e|0}e=Yc(a|0,b|0,52)|0;Z()|0;e=e&15;a:do if(!e)c=0;else{d=1;while(1){c=Yc(a|0,b|0,(15-d|0)*3|0)|0;Z()|0;c=c&7;if(c|0)break a;if(d>>>0<e>>>0)d=d+1|0;else{c=0;break}}}while(0);e=(c|0)==0&1;return e|0}function Hb(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;e=a;d=f[e>>2]|0;e=f[e+4>>2]|0;if(0==0&(e&15728640|0)==0){if((c|0)<=0){x=0;return x|0}x=b;f[x>>2]=d;f[x+4>>2]=e;if((c|0)==1){x=0;return x|0}d=1;do{v=a+(d<<3)|0;w=f[v+4>>2]|0;x=b+(d<<3)|0;f[x>>2]=f[v>>2];f[x+4>>2]=w;d=d+1|0}while((d|0)!=(c|0));d=0;return d|0}v=c<<3;w=Nc(v)|0;$c(w|0,a|0,v|0)|0;u=Pc(c,8)|0;a:do if(c|0){d=c;b:while(1){h=w;l=f[h>>2]|0;h=f[h+4>>2]|0;s=Yc(l|0,h|0,52)|0;Z()|0;s=s&15;t=s+-1|0;r=(d|0)>0;c:do if(r){q=((d|0)<0)<<31>>31;o=Zc(t|0,0,52)|0;p=Z()|0;if(t>>>0>15){e=0;a=l;c=h;while(1){if(!((a|0)==0&(c|0)==0)){g=Yc(a|0,c|0,52)|0;Z()|0;g=g&15;i=(g|0)<(t|0);g=(g|0)==(t|0);k=i?0:g?a:0;a=i?0:g?c:0;c=Xc(k|0,a|0,d|0,q|0)|0;Z()|0;g=u+(c<<3)|0;i=g;j=f[i>>2]|0;i=f[i+4>>2]|0;if((j|0)==0&(i|0)==0)c=k;else{o=0;n=c;m=j;c=k;j=g;while(1){if((o|0)>(d|0)){x=33;break b}if((m|0)==(c|0)&(i&-117440513|0)==(a|0)){g=Yc(m|0,i|0,56)|0;Z()|0;g=g&7;if((g|0)==7){x=38;break b}p=Zc(g+1|0,0,56)|0;a=Z()|0|a&-117440513;f[j>>2]=0;f[j+4>>2]=0;j=n;c=p|c}else j=(n+1|0)%(d|0)|0;g=u+(j<<3)|0;i=g;m=f[i>>2]|0;i=f[i+4>>2]|0;if((m|0)==0&(i|0)==0)break;else{o=o+1|0;n=j;j=g}}}p=g;f[p>>2]=c;f[p+4>>2]=a}e=e+1|0;if((e|0)>=(d|0))break c;c=w+(e<<3)|0;a=f[c>>2]|0;c=f[c+4>>2]|0}}e=0;a=l;c=h;while(1){if(!((a|0)==0&(c|0)==0)){i=Yc(a|0,c|0,52)|0;Z()|0;i=i&15;if((i|0)>=(t|0)){if((i|0)!=(t|0)){a=a|o;c=c&-15728641|p;if(i>>>0>=s>>>0){g=t;do{n=Zc(7,0,(14-g|0)*3|0)|0;g=g+1|0;a=n|a;c=Z()|0|c}while(g>>>0<i>>>0)}}}else{a=0;c=0}i=Xc(a|0,c|0,d|0,q|0)|0;Z()|0;g=u+(i<<3)|0;j=g;k=f[j>>2]|0;j=f[j+4>>2]|0;if(!((k|0)==0&(j|0)==0)){n=0;m=k;k=g;while(1){if((n|0)>(d|0)){x=33;break b}if((m|0)==(a|0)&(j&-117440513|0)==(c|0)){g=Yc(m|0,j|0,56)|0;Z()|0;g=g&7;if((g|0)==7){x=38;break b}m=Zc(g+1|0,0,56)|0;c=Z()|0|c&-117440513;f[k>>2]=0;f[k+4>>2]=0;a=m|a}else i=(i+1|0)%(d|0)|0;g=u+(i<<3)|0;j=g;m=f[j>>2]|0;j=f[j+4>>2]|0;if((m|0)==0&(j|0)==0)break;else{n=n+1|0;k=g}}}n=g;f[n>>2]=a;f[n+4>>2]=c}e=e+1|0;if((e|0)>=(d|0))break c;c=w+(e<<3)|0;a=f[c>>2]|0;c=f[c+4>>2]|0}}while(0);if((d+5|0)>>>0<11){x=84;break}q=Nc(((d|0)/6|0)<<3)|0;d:do if(r){o=0;n=0;do{i=u+(o<<3)|0;a=i;e=f[a>>2]|0;a=f[a+4>>2]|0;if(!((e|0)==0&(a|0)==0)){j=Yc(e|0,a|0,56)|0;Z()|0;j=j&7;c=j+1|0;k=a&-117440513;p=Yc(e|0,a|0,45)|0;Z()|0;e:do if(ya(p&127)|0){m=Yc(e|0,a|0,52)|0;Z()|0;m=m&15;if(m|0){g=1;while(1){p=Zc(7,0,(15-g|0)*3|0)|0;if(!((e&p|0)==0&(k&(Z()|0)|0)==0))break e;if(g>>>0<m>>>0)g=g+1|0;else break}}a=Zc(c|0,0,56)|0;e=a|e;a=Z()|0|k;c=i;f[c>>2]=e;f[c+4>>2]=a;c=j+2|0}while(0);if((c|0)==7){p=q+(n<<3)|0;f[p>>2]=e;f[p+4>>2]=a&-117440513;n=n+1|0}}o=o+1|0}while((o|0)!=(d|0));if(r){p=((d|0)<0)<<31>>31;m=Zc(t|0,0,52)|0;o=Z()|0;if(t>>>0>15){a=0;e=0;while(1){do if(!((l|0)==0&(h|0)==0)){j=Yc(l|0,h|0,52)|0;Z()|0;j=j&15;g=(j|0)<(t|0);j=(j|0)==(t|0);i=g?0:j?l:0;j=g?0:j?h:0;g=Xc(i|0,j|0,d|0,p|0)|0;Z()|0;c=0;while(1){if((c|0)>(d|0)){x=83;break b}s=u+(g<<3)|0;k=f[s+4>>2]|0;if((k&-117440513|0)==(j|0)?(f[s>>2]|0)==(i|0):0){x=55;break}g=(g+1|0)%(d|0)|0;s=u+(g<<3)|0;if((f[s>>2]|0)==(i|0)?(f[s+4>>2]|0)==(j|0):0)break;else c=c+1|0}if((x|0)==55?(x=0,0==0&(k&117440512|0)==100663296):0)break;s=b+(e<<3)|0;f[s>>2]=l;f[s+4>>2]=h;e=e+1|0}while(0);a=a+1|0;if((a|0)>=(d|0)){d=n;break d}h=w+(a<<3)|0;l=f[h>>2]|0;h=f[h+4>>2]|0}}a=0;e=0;while(1){do if(!((l|0)==0&(h|0)==0)){j=Yc(l|0,h|0,52)|0;Z()|0;j=j&15;if((j|0)>=(t|0))if((j|0)!=(t|0)){c=l|m;g=h&-15728641|o;if(j>>>0<s>>>0)j=g;else{i=t;do{r=Zc(7,0,(14-i|0)*3|0)|0;i=i+1|0;c=r|c;g=Z()|0|g}while(i>>>0<j>>>0);j=g}}else{c=l;j=h}else{c=0;j=0}i=Xc(c|0,j|0,d|0,p|0)|0;Z()|0;g=0;while(1){if((g|0)>(d|0)){x=83;break b}r=u+(i<<3)|0;k=f[r+4>>2]|0;if((k&-117440513|0)==(j|0)?(f[r>>2]|0)==(c|0):0){x=78;break}i=(i+1|0)%(d|0)|0;r=u+(i<<3)|0;if((f[r>>2]|0)==(c|0)?(f[r+4>>2]|0)==(j|0):0)break;else g=g+1|0}if((x|0)==78?(x=0,0==0&(k&117440512|0)==100663296):0)break;r=b+(e<<3)|0;f[r>>2]=l;f[r+4>>2]=h;e=e+1|0}while(0);a=a+1|0;if((a|0)>=(d|0)){d=n;break d}h=w+(a<<3)|0;l=f[h>>2]|0;h=f[h+4>>2]|0}}else{e=0;d=n}}else{e=0;d=0}while(0);ad(u|0,0,v|0)|0;$c(w|0,q|0,d<<3|0)|0;Oc(q);if(!d)break a;else b=b+(e<<3)|0}if((x|0)==33){Oc(w);Oc(u);x=-1;return x|0}else if((x|0)==38){Oc(w);Oc(u);x=-2;return x|0}else if((x|0)==83){Oc(q);Oc(w);Oc(u);x=-1;return x|0}else if((x|0)==84){$c(b|0,w|0,d<<3|0)|0;break}}while(0);Oc(w);Oc(u);x=0;return x|0}function Ib(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var g=0,h=0,i=0,j=0,k=0,l=0;if((b|0)<=0){e=0;return e|0}g=0;l=0;a:while(1){if((g|0)>=(d|0)){g=-1;h=11;break}k=a+(l<<3)|0;i=k;h=f[i>>2]|0;i=f[i+4>>2]|0;do if(!((h|0)==0&(i|0)==0)){j=Yc(h|0,i|0,52)|0;Z()|0;j=j&15;if((j|0)>(e|0)){g=-2;h=11;break a}if((j|0)==(e|0)){k=c+(g<<3)|0;f[k>>2]=h;f[k+4>>2]=i;g=g+1|0;break}h=(pc(7,e-j|0)|0)+g|0;if((h|0)>(d|0)){g=-1;h=11;break a}Fb(f[k>>2]|0,f[k+4>>2]|0,e,c+(g<<3)|0);g=h}while(0);l=l+1|0;if((l|0)>=(b|0)){g=0;h=11;break}}if((h|0)==11)return g|0;return 0}function Jb(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0;if((b|0)<=0){c=0;return c|0}d=0;h=0;a:while(1){e=a+(h<<3)|0;g=f[e>>2]|0;e=f[e+4>>2]|0;do if(!((g|0)==0&(e|0)==0)){e=Yc(g|0,e|0,52)|0;Z()|0;e=e&15;if((e|0)>(c|0)){d=-1;e=9;break a}if((e|0)==(c|0)){d=d+1|0;break}else{d=(pc(7,c-e|0)|0)+d|0;break}}while(0);h=h+1|0;if((h|0)>=(b|0)){e=9;break}}if((e|0)==9)return d|0;return 0}function Kb(a,b){a=a|0;b=b|0;b=Yc(a|0,b|0,52)|0;Z()|0;return b&1|0}function Lb(a,b){a=a|0;b=b|0;var c=0,d=0,e=0;e=Yc(a|0,b|0,52)|0;Z()|0;e=e&15;if(!e){e=0;return e|0}d=1;while(1){c=Yc(a|0,b|0,(15-d|0)*3|0)|0;Z()|0;c=c&7;if(c|0){d=5;break}if(d>>>0<e>>>0)d=d+1|0;else{c=0;d=5;break}}if((d|0)==5)return c|0;return 0}function Mb(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0;i=Yc(a|0,b|0,52)|0;Z()|0;i=i&15;if(!i){h=b;i=a;Y(h|0);return i|0}h=1;c=0;while(1){f=(15-h|0)*3|0;d=Zc(7,0,f|0)|0;e=Z()|0;g=Yc(a|0,b|0,f|0)|0;Z()|0;f=Zc(_a(g&7)|0,0,f|0)|0;g=Z()|0;a=f|a&~d;b=g|b&~e;a:do if(!c)if(!((f&d|0)==0&(g&e|0)==0)){d=Yc(a|0,b|0,52)|0;Z()|0;d=d&15;if(!d)c=1;else{c=1;b:while(1){g=Yc(a|0,b|0,(15-c|0)*3|0)|0;Z()|0;switch(g&7){case 1:break b;case 0:break;default:{c=1;break a}}if(c>>>0<d>>>0)c=c+1|0;else{c=1;break a}}c=1;while(1){g=(15-c|0)*3|0;e=Yc(a|0,b|0,g|0)|0;Z()|0;f=Zc(7,0,g|0)|0;b=b&~(Z()|0);g=Zc(_a(e&7)|0,0,g|0)|0;a=a&~f|g;b=b|(Z()|0);if(c>>>0<d>>>0)c=c+1|0;else{c=1;break}}}}else c=0;while(0);if(h>>>0<i>>>0)h=h+1|0;else break}Y(b|0);return a|0}function Nb(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0;d=Yc(a|0,b|0,52)|0;Z()|0;d=d&15;if(!d){c=b;d=a;Y(c|0);return d|0}c=1;while(1){f=(15-c|0)*3|0;g=Yc(a|0,b|0,f|0)|0;Z()|0;e=Zc(7,0,f|0)|0;b=b&~(Z()|0);f=Zc(_a(g&7)|0,0,f|0)|0;a=f|a&~e;b=Z()|0|b;if(c>>>0<d>>>0)c=c+1|0;else break}Y(b|0);return a|0}function Ob(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0,h=0,i=0;i=Yc(a|0,b|0,52)|0;Z()|0;i=i&15;if(!i){h=b;i=a;Y(h|0);return i|0}h=1;c=0;while(1){f=(15-h|0)*3|0;d=Zc(7,0,f|0)|0;e=Z()|0;g=Yc(a|0,b|0,f|0)|0;Z()|0;f=Zc($a(g&7)|0,0,f|0)|0;g=Z()|0;a=f|a&~d;b=g|b&~e;a:do if(!c)if(!((f&d|0)==0&(g&e|0)==0)){d=Yc(a|0,b|0,52)|0;Z()|0;d=d&15;if(!d)c=1;else{c=1;b:while(1){g=Yc(a|0,b|0,(15-c|0)*3|0)|0;Z()|0;switch(g&7){case 1:break b;case 0:break;default:{c=1;break a}}if(c>>>0<d>>>0)c=c+1|0;else{c=1;break a}}c=1;while(1){e=(15-c|0)*3|0;f=Zc(7,0,e|0)|0;g=b&~(Z()|0);b=Yc(a|0,b|0,e|0)|0;Z()|0;b=Zc($a(b&7)|0,0,e|0)|0;a=a&~f|b;b=g|(Z()|0);if(c>>>0<d>>>0)c=c+1|0;else{c=1;break}}}}else c=0;while(0);if(h>>>0<i>>>0)h=h+1|0;else break}Y(b|0);return a|0}function Pb(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0,g=0;d=Yc(a|0,b|0,52)|0;Z()|0;d=d&15;if(!d){c=b;d=a;Y(c|0);return d|0}c=1;while(1){g=(15-c|0)*3|0;f=Zc(7,0,g|0)|0;e=b&~(Z()|0);b=Yc(a|0,b|0,g|0)|0;Z()|0;b=Zc($a(b&7)|0,0,g|0)|0;a=b|a&~f;b=Z()|0|e;if(c>>>0<d>>>0)c=c+1|0;else break}Y(b|0);return a|0}function Qb(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0;j=ea;ea=ea+64|0;i=j+40|0;d=j+24|0;e=j+12|0;g=j;Zc(b|0,0,52)|0;c=Z()|0|134225919;if(!b){if((f[a+4>>2]|0)>2){h=0;i=0;Y(h|0);ea=j;return i|0}if((f[a+8>>2]|0)>2){h=0;i=0;Y(h|0);ea=j;return i|0}if((f[a+12>>2]|0)>2){h=0;i=0;Y(h|0);ea=j;return i|0}Zc(Aa(a)|0,0,45)|0;h=Z()|0|c;i=-1;Y(h|0);ea=j;return i|0};f[i>>2]=f[a>>2];f[i+4>>2]=f[a+4>>2];f[i+8>>2]=f[a+8>>2];f[i+12>>2]=f[a+12>>2];h=i+4|0;if((b|0)>0){a=-1;while(1){f[d>>2]=f[h>>2];f[d+4>>2]=f[h+4>>2];f[d+8>>2]=f[h+8>>2];if(!(b&1)){Ua(h);f[e>>2]=f[h>>2];f[e+4>>2]=f[h+4>>2];f[e+8>>2]=f[h+8>>2];Wa(e)}else{Ta(h);f[e>>2]=f[h>>2];f[e+4>>2]=f[h+4>>2];f[e+8>>2]=f[h+8>>2];Va(e)}Qa(d,e,g);Na(g);l=(15-b|0)*3|0;k=Zc(7,0,l|0)|0;c=c&~(Z()|0);l=Zc(Sa(g)|0,0,l|0)|0;a=l|a&~k;c=Z()|0|c;if((b|0)>1)b=b+-1|0;else break}}else a=-1;a:do if(((f[h>>2]|0)<=2?(f[i+8>>2]|0)<=2:0)?(f[i+12>>2]|0)<=2:0){d=Aa(i)|0;b=Zc(d|0,0,45)|0;b=b|a;a=Z()|0|c&-1040385;g=Ba(i)|0;if(!(ya(d)|0)){if((g|0)<=0)break;e=0;while(1){d=Yc(b|0,a|0,52)|0;Z()|0;d=d&15;if(d){c=1;while(1){l=(15-c|0)*3|0;i=Yc(b|0,a|0,l|0)|0;Z()|0;k=Zc(7,0,l|0)|0;a=a&~(Z()|0);l=Zc(_a(i&7)|0,0,l|0)|0;b=b&~k|l;a=a|(Z()|0);if(c>>>0<d>>>0)c=c+1|0;else break}}e=e+1|0;if((e|0)==(g|0))break a}}e=Yc(b|0,a|0,52)|0;Z()|0;e=e&15;b:do if(e){c=1;c:while(1){l=Yc(b|0,a|0,(15-c|0)*3|0)|0;Z()|0;switch(l&7){case 1:break c;case 0:break;default:break b}if(c>>>0<e>>>0)c=c+1|0;else break b}if(Ca(d,f[i>>2]|0)|0){c=1;while(1){i=(15-c|0)*3|0;k=Zc(7,0,i|0)|0;l=a&~(Z()|0);a=Yc(b|0,a|0,i|0)|0;Z()|0;a=Zc($a(a&7)|0,0,i|0)|0;b=b&~k|a;a=l|(Z()|0);if(c>>>0<e>>>0)c=c+1|0;else break}}else{c=1;while(1){l=(15-c|0)*3|0;i=Yc(b|0,a|0,l|0)|0;Z()|0;k=Zc(7,0,l|0)|0;a=a&~(Z()|0);l=Zc(_a(i&7)|0,0,l|0)|0;b=b&~k|l;a=a|(Z()|0);if(c>>>0<e>>>0)c=c+1|0;else break}}}while(0);if((g|0)>0){c=0;do{b=Mb(b,a)|0;a=Z()|0;c=c+1|0}while((c|0)!=(g|0))}}else{b=0;a=0}while(0);k=a;l=b;Y(k|0);ea=j;return l|0}function Rb(a){a=a|0;return (a|0)%2|0|0}function Sb(a,b){a=a|0;b=b|0;var c=0,d=0;d=ea;ea=ea+16|0;c=d;if((b>>>0<=15?!(0==0?(f[a+4>>2]&2146435072|0)==2146435072:0):0)?!(0==0?(f[a+8+4>>2]&2146435072|0)==2146435072:0):0){hb(a,b,c);b=Qb(c,b)|0;a=Z()|0}else{a=0;b=0}Y(a|0);ea=d;return b|0}function Tb(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0;e=c+4|0;g=Yc(a|0,b|0,52)|0;Z()|0;g=g&15;h=Yc(a|0,b|0,45)|0;Z()|0;d=(g|0)==0;if(!(ya(h&127)|0)){if(d){h=0;return h|0}if((f[e>>2]|0)==0?(f[c+8>>2]|0)==0:0)d=(f[c+12>>2]|0)!=0&1;else d=1}else if(d){h=1;return h|0}else d=1;c=1;while(1){if(!(c&1))Wa(e);else Va(e);h=Yc(a|0,b|0,(15-c|0)*3|0)|0;Z()|0;Xa(e,h&7);if(c>>>0<g>>>0)c=c+1|0;else break}return d|0}function Ub(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0;l=ea;ea=ea+16|0;j=l;k=Yc(a|0,b|0,45)|0;Z()|0;k=k&127;a:do if((ya(k)|0)!=0?(g=Yc(a|0,b|0,52)|0,Z()|0,g=g&15,(g|0)!=0):0){d=1;b:while(1){i=Yc(a|0,b|0,(15-d|0)*3|0)|0;Z()|0;switch(i&7){case 5:break b;case 0:break;default:{d=b;break a}}if(d>>>0<g>>>0)d=d+1|0;else{d=b;break a}}e=1;d=b;while(1){b=(15-e|0)*3|0;h=Zc(7,0,b|0)|0;i=d&~(Z()|0);d=Yc(a|0,d|0,b|0)|0;Z()|0;d=Zc($a(d&7)|0,0,b|0)|0;a=a&~h|d;d=i|(Z()|0);if(e>>>0<g>>>0)e=e+1|0;else break}}else d=b;while(0);i=7728+(k*28|0)|0;f[c>>2]=f[i>>2];f[c+4>>2]=f[i+4>>2];f[c+8>>2]=f[i+8>>2];f[c+12>>2]=f[i+12>>2];if(!(Tb(a,d,c)|0)){ea=l;return}h=c+4|0;f[j>>2]=f[h>>2];f[j+4>>2]=f[h+4>>2];f[j+8>>2]=f[h+8>>2];g=Yc(a|0,d|0,52)|0;Z()|0;i=g&15;if(!(g&1))g=i;else{Wa(h);g=i+1|0}if(!(ya(k)|0))d=0;else{c:do if(!i)d=0;else{b=1;while(1){e=Yc(a|0,d|0,(15-b|0)*3|0)|0;Z()|0;e=e&7;if(e|0){d=e;break c}if(b>>>0<i>>>0)b=b+1|0;else{d=0;break}}}while(0);d=(d|0)==4&1}if(!(mb(c,g,d,0)|0)){if((g|0)!=(i|0)){f[h>>2]=f[j>>2];f[h+4>>2]=f[j+4>>2];f[h+8>>2]=f[j+8>>2]}}else{if(ya(k)|0)do{}while((mb(c,g,0,0)|0)!=0);if((g|0)!=(i|0))Ua(h)}ea=l;return}function Vb(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;d=ea;ea=ea+16|0;e=d;Ub(a,b,e);b=Yc(a|0,b|0,52)|0;Z()|0;kb(e,b&15,c);ea=d;return}function Wb(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0;h=ea;ea=ea+16|0;f=h;Ub(a,b,f);g=Yc(a|0,b|0,52)|0;Z()|0;g=g&15;e=Yc(a|0,b|0,45)|0;Z()|0;if(!(ya(e&127)|0)){b=0;nb(f,g,b,c);ea=h;return}a:do if(!g)d=0;else{e=1;while(1){d=Yc(a|0,b|0,(15-e|0)*3|0)|0;Z()|0;d=d&7;if(d|0)break a;if(e>>>0<g>>>0)e=e+1|0;else{d=0;break}}}while(0);b=(d|0)==0&1;nb(f,g,b,c);ea=h;return}function Xb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0;i=ea;ea=ea+64|0;h=i;if((a|0)==(c|0)&(b|0)==(d|0)|(0!=0|(b&2013265920|0)!=134217728|(0!=0|(d&2013265920|0)!=134217728))){h=0;ea=i;return h|0}e=Yc(a|0,b|0,52)|0;Z()|0;e=e&15;g=Yc(c|0,d|0,52)|0;Z()|0;if((e|0)!=(g&15|0)){h=0;ea=i;return h|0}g=e+-1|0;if(e>>>0>1?(k=Db(a,b,g)|0,j=Z()|0,g=Db(c,d,g)|0,(k|0)==(g|0)&(j|0)==(Z()|0)):0){g=(e^15)*3|0;e=Yc(a|0,b|0,g|0)|0;Z()|0;e=e&7;g=Yc(c|0,d|0,g|0)|0;Z()|0;g=g&7;if((e|0)==0|(g|0)==0){k=1;ea=i;return k|0}if((f[21136+(e<<2)>>2]|0)==(g|0)){k=1;ea=i;return k|0}if((f[21168+(e<<2)>>2]|0)==(g|0)){k=1;ea=i;return k|0}}e=h;g=e+56|0;do{f[e>>2]=0;e=e+4|0}while((e|0)<(g|0));oa(a,b,1,h);k=h;if(((((!((f[k>>2]|0)==(c|0)?(f[k+4>>2]|0)==(d|0):0)?(k=h+8|0,!((f[k>>2]|0)==(c|0)?(f[k+4>>2]|0)==(d|0):0)):0)?(k=h+16|0,!((f[k>>2]|0)==(c|0)?(f[k+4>>2]|0)==(d|0):0)):0)?(k=h+24|0,!((f[k>>2]|0)==(c|0)?(f[k+4>>2]|0)==(d|0):0)):0)?(k=h+32|0,!((f[k>>2]|0)==(c|0)?(f[k+4>>2]|0)==(d|0):0)):0)?(k=h+40|0,!((f[k>>2]|0)==(c|0)?(f[k+4>>2]|0)==(d|0):0)):0){e=h+48|0;e=((f[e>>2]|0)==(c|0)?(f[e+4>>2]|0)==(d|0):0)&1}else e=1;k=e;ea=i;return k|0}function Yb(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0;h=ea;ea=ea+16|0;e=h;if(!(Xb(a,b,c,d)|0)){a=0;g=0;Y(a|0);ea=h;return g|0}g=b&-2130706433;f[e>>2]=0;i=sa(a,b,1,e)|0;if(!((i|0)==(c|0)&(Z()|0)==(d|0))){f[e>>2]=0;i=sa(a,b,2,e)|0;if(!((i|0)==(c|0)&(Z()|0)==(d|0))){f[e>>2]=0;i=sa(a,b,3,e)|0;if(!((i|0)==(c|0)&(Z()|0)==(d|0))){f[e>>2]=0;i=sa(a,b,4,e)|0;if(!((i|0)==(c|0)&(Z()|0)==(d|0))){f[e>>2]=0;i=sa(a,b,5,e)|0;if(!((i|0)==(c|0)&(Z()|0)==(d|0))){f[e>>2]=0;i=sa(a,b,6,e)|0;if((i|0)==(c|0)&(Z()|0)==(d|0)){b=0;c=100663296}else{g=0;i=0;Y(g|0);ea=h;return i|0}}else{b=0;c=83886080}}else{b=0;c=67108864}}else{b=0;c=50331648}}else{b=0;c=33554432}}else{b=0;c=16777216}g=g|c|268435456;i=a|b;Y(g|0);ea=h;return i|0}function Zb(a,b){a=a|0;b=b|0;var c=0;c=0==0&(b&2013265920|0)==268435456;Y((c?b&-2130706433|134217728:0)|0);return (c?a:0)|0}function _b(a,b){a=a|0;b=b|0;var c=0,d=0,e=0;d=ea;ea=ea+16|0;c=d;if(!(0==0&(b&2013265920|0)==268435456)){b=0;c=0;Y(b|0);ea=d;return c|0}e=Yc(a|0,b|0,56)|0;Z()|0;f[c>>2]=0;c=sa(a,b&-2130706433|134217728,e&7,c)|0;b=Z()|0;Y(b|0);ea=d;return c|0}function $b(a,b){a=a|0;b=b|0;var c=0;if(!(0==0&(b&2013265920|0)==268435456)){c=0;return c|0}c=Yc(a|0,b|0,56)|0;Z()|0;switch(c&7){case 0:case 7:{c=0;return c|0}default:{}}c=b&-2130706433|134217728;if(0==0&(b&117440512|0)==16777216&(Gb(a,c)|0)!=0){c=0;return c|0}c=Cb(a,c)|0;return c|0}function ac(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0;g=ea;ea=ea+16|0;d=g;h=0==0&(b&2013265920|0)==268435456;e=b&-2130706433|134217728;i=c;f[i>>2]=h?a:0;f[i+4>>2]=h?e:0;if(h){b=Yc(a|0,b|0,56)|0;Z()|0;f[d>>2]=0;a=sa(a,e,b&7,d)|0;b=Z()|0}else{a=0;b=0}i=c+8|0;f[i>>2]=a;f[i+4>>2]=b;ea=g;return}function bc(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;e=(Gb(a,b)|0)==0;b=b&-2130706433;d=c;f[d>>2]=e?a:0;f[d+4>>2]=e?b|285212672:0;d=c+8|0;f[d>>2]=a;f[d+4>>2]=b|301989888;d=c+16|0;f[d>>2]=a;f[d+4>>2]=b|318767104;d=c+24|0;f[d>>2]=a;f[d+4>>2]=b|335544320;d=c+32|0;f[d>>2]=a;f[d+4>>2]=b|352321536;c=c+40|0;f[c>>2]=a;f[c+4>>2]=b|369098752;return}function cc(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0;l=ea;ea=ea+368|0;e=l+352|0;i=l+184|0;j=l+16|0;k=l;ad(i|0,0,168)|0;ad(j|0,0,168)|0;f[k>>2]=0;f[k+4>>2]=0;f[k+8>>2]=0;f[k+12>>2]=0;h=0==0&(b&2013265920|0)==268435456;d=b&-2130706433|134217728;Wb(h?a:0,h?d:0,i);if(h){b=Yc(a|0,b|0,56)|0;Z()|0;f[e>>2]=0;a=sa(a,d,b&7,e)|0;b=Z()|0}else{a=0;b=0}Wb(a,b,j);if((f[i>>2]|0)<=0){k=0;f[c>>2]=k;ea=l;return}h=i+24|0;a=0;b=0;g=0;do{e=i+8+(g<<4)|0;a:do if((f[j>>2]|0)>0){d=0;while(1){if(pb(e,j+8+(d<<4)|0,1.0e-06)|0)break;d=d+1|0;if((d|0)>=(f[j>>2]|0))break a}b:do if(!g){if((f[j>>2]|0)>0){d=0;do{if(pb(h,j+8+(d<<4)|0,1.0e-06)|0)break b;d=d+1|0}while((d|0)<(f[j>>2]|0))};f[k>>2]=f[e>>2];f[k+4>>2]=f[e+4>>2];f[k+8>>2]=f[e+8>>2];f[k+12>>2]=f[e+12>>2];b=1;break a}while(0);d=c+8+(a<<4)|0;f[d>>2]=f[e>>2];f[d+4>>2]=f[e+4>>2];f[d+8>>2]=f[e+8>>2];f[d+12>>2]=f[e+12>>2];a=a+1|0}while(0);g=g+1|0}while((g|0)<(f[i>>2]|0));if(!b){k=a;f[c>>2]=k;ea=l;return}j=c+8+(a<<4)|0;f[j>>2]=f[k>>2];f[j+4>>2]=f[k+4>>2];f[j+8>>2]=f[k+8>>2];f[j+12>>2]=f[k+12>>2];k=a+1|0;f[c>>2]=k;ea=l;return}function dc(a){a=a|0;var b=0,c=0,d=0;b=Pc(1,12)|0;if(!b)$(22394,22349,46,22407);c=a+4|0;d=f[c>>2]|0;if(d|0){d=d+8|0;f[d>>2]=b;f[c>>2]=b;return b|0}if(f[a>>2]|0)$(22424,22349,58,22447);d=a;f[d>>2]=b;f[c>>2]=b;return b|0}function ec(a,b){a=a|0;b=b|0;var c=0,d=0;d=Nc(24)|0;if(!d)$(22461,22349,75,22475);f[d>>2]=f[b>>2];f[d+4>>2]=f[b+4>>2];f[d+8>>2]=f[b+8>>2];f[d+12>>2]=f[b+12>>2];f[d+16>>2]=0;b=a+4|0;c=f[b>>2]|0;if(c|0){f[c+16>>2]=d;f[b>>2]=d;return d|0}if(f[a>>2]|0)$(22490,22349,79,22475);f[a>>2]=d;f[b>>2]=d;return d|0}function fc(a){a=a|0;var b=0,c=0,d=0,e=0;if(!a)return;d=1;while(1){b=f[a>>2]|0;if(b|0)do{c=f[b>>2]|0;if(c|0)do{e=c;c=f[c+16>>2]|0;Oc(e)}while((c|0)!=0);e=b;b=f[b+8>>2]|0;Oc(e)}while((b|0)!=0);b=a;a=f[a+8>>2]|0;if(!d)Oc(b);if(!a)break;else d=0}return}function gc(a){a=a|0;var b=0,c=0,d=0,e=0,g=0.0,h=0,i=0.0,j=0.0,k=0,l=0,m=0,n=0,o=0,q=0,r=0.0,s=0.0,t=0.0,u=0.0,v=0.0,w=0.0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,G=0,H=0,I=0,J=0;e=a+8|0;if(f[e>>2]|0){J=1;return J|0}d=f[a>>2]|0;if(!d){J=0;return J|0}b=d;c=0;do{c=c+1|0;b=f[b+8>>2]|0}while((b|0)!=0);if(c>>>0<2){J=0;return J|0}H=Nc(c<<2)|0;if(!H)$(22510,22349,312,22529);G=Nc(c<<5)|0;if(!G)$(22551,22349,316,22529);f[a>>2]=0;y=a+4|0;f[y>>2]=0;f[e>>2]=0;c=0;E=0;x=0;m=0;a:while(1){l=f[d>>2]|0;if(l){g=0.0;h=l;do{j=+p[h+8>>3];b=h;h=f[h+16>>2]|0;k=(h|0)==0;e=k?l:h;i=+p[e+8>>3];if(+F(+(j-i))>3.141592653589793){J=14;break}g=g+(i-j)*(+p[b>>3]+ +p[e>>3])}while(!k);if((J|0)==14){J=0;g=0.0;b=l;do{w=+p[b+8>>3];D=b+16|0;C=f[D>>2]|0;C=(C|0)==0?l:C;v=+p[C+8>>3];g=g+(+p[b>>3]+ +p[C>>3])*((v<0.0?v+6.283185307179586:v)-(w<0.0?w+6.283185307179586:w));b=f[((b|0)==0?d:D)>>2]|0}while((b|0)!=0)}if(g>0.0){f[H+(E<<2)>>2]=d;E=E+1|0;e=x;b=m}else J=19}else J=19;if((J|0)==19){J=0;do if(!c)if(!m)if(!(f[a>>2]|0)){e=y;h=a;b=d;c=a;break}else{J=27;break a}else{e=y;h=m+8|0;b=d;c=a;break}else{b=c+8|0;if(f[b>>2]|0){J=21;break a}c=Pc(1,12)|0;if(!c){J=23;break a}f[b>>2]=c;e=c+4|0;h=c;b=m}while(0);f[h>>2]=d;f[e>>2]=d;h=G+(x<<5)|0;k=f[d>>2]|0;if(k){l=G+(x<<5)+8|0;p[l>>3]=1797693134862315708145274.0e284;m=G+(x<<5)+24|0;p[m>>3]=1797693134862315708145274.0e284;p[h>>3]=-1797693134862315708145274.0e284;n=G+(x<<5)+16|0;p[n>>3]=-1797693134862315708145274.0e284;t=1797693134862315708145274.0e284;u=-1797693134862315708145274.0e284;e=0;o=k;j=1797693134862315708145274.0e284;r=1797693134862315708145274.0e284;s=-1797693134862315708145274.0e284;i=-1797693134862315708145274.0e284;while(1){g=+p[o>>3];w=+p[o+8>>3];o=f[o+16>>2]|0;q=(o|0)==0;v=+p[(q?k:o)+8>>3];if(g<j){p[l>>3]=g;j=g}if(w<r){p[m>>3]=w;r=w}if(g>s)p[h>>3]=g;else g=s;if(w>i){p[n>>3]=w;i=w}t=w>0.0&w<t?w:t;u=w<0.0&w>u?w:u;e=e|+F(+(w-v))>3.141592653589793;if(q)break;else s=g}if(e){p[n>>3]=u;p[m>>3]=t}}else{f[h>>2]=0;f[h+4>>2]=0;f[h+8>>2]=0;f[h+12>>2]=0;f[h+16>>2]=0;f[h+20>>2]=0;f[h+24>>2]=0;f[h+28>>2]=0}e=x+1|0}D=d+8|0;d=f[D>>2]|0;f[D>>2]=0;if(!d){J=45;break}else{x=e;m=b}}if((J|0)==21)$(22327,22349,32,22361);else if((J|0)==23)$(22381,22349,34,22361);else if((J|0)==27)$(22424,22349,58,22447);else if((J|0)==45){b:do if((E|0)>0){D=(e|0)==0;B=e<<2;C=(a|0)==0;A=0;b=0;while(1){z=f[H+(A<<2)>>2]|0;if(!D){x=Nc(B)|0;if(!x){J=50;break}y=Nc(B)|0;if(!y){J=52;break}c:do if(!C){e=0;c=0;h=a;while(1){d=G+(e<<5)|0;if(hc(f[h>>2]|0,d,f[z>>2]|0)|0){f[x+(c<<2)>>2]=h;f[y+(c<<2)>>2]=d;q=c+1|0}else q=c;h=f[h+8>>2]|0;if(!h)break;else{e=e+1|0;c=q}}if((q|0)>0){d=f[x>>2]|0;if((q|0)==1)c=d;else{n=0;o=-1;c=d;m=d;while(1){k=f[m>>2]|0;d=0;h=0;while(1){e=f[f[x+(h<<2)>>2]>>2]|0;if((e|0)==(k|0))l=d;else l=d+((hc(e,f[y+(h<<2)>>2]|0,f[k>>2]|0)|0)&1)|0;h=h+1|0;if((h|0)==(q|0))break;else d=l}e=(l|0)>(o|0);c=e?m:c;d=n+1|0;if((d|0)==(q|0))break c;n=d;o=e?l:o;m=f[x+(d<<2)>>2]|0}}}else c=0}else c=0;while(0);Oc(x);Oc(y);if(c){e=c+4|0;d=f[e>>2]|0;if(!d){if(f[c>>2]|0){J=70;break}}else c=d+8|0;f[c>>2]=z;f[e>>2]=z}else J=73}else J=73;if((J|0)==73){J=0;b=f[z>>2]|0;if(b|0)do{y=b;b=f[b+16>>2]|0;Oc(y)}while((b|0)!=0);Oc(z);b=2}A=A+1|0;if((A|0)>=(E|0)){I=b;break b}}if((J|0)==50)$(22566,22349,246,22585);else if((J|0)==52)$(22604,22349,248,22585);else if((J|0)==70)$(22424,22349,58,22447)}else I=0;while(0);Oc(H);Oc(G);J=I;return J|0}return 0}function hc(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,g=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0;if(!(Ja(b,c)|0)){a=0;return a|0}b=Ha(b)|0;k=+p[c>>3];d=+p[c+8>>3];d=b&d<0.0?d+6.283185307179586:d;a=f[a>>2]|0;if(!a){a=0;return a|0}if(b){b=0;c=a;a:while(1){while(1){h=+p[c>>3];j=+p[c+8>>3];c=c+16|0;l=f[c>>2]|0;l=(l|0)==0?a:l;g=+p[l>>3];e=+p[l+8>>3];if(h>g){i=h;h=j}else{i=g;g=h;h=e;e=j}if(!(k<g|k>i))break;c=f[c>>2]|0;if(!c){c=22;break a}}j=e<0.0?e+6.283185307179586:e;h=h<0.0?h+6.283185307179586:h;d=h==d|j==d?d+-2.220446049250313e-16:d;j=j+(k-g)/(i-g)*(h-j);if((j<0.0?j+6.283185307179586:j)>d)b=b^1;c=f[c>>2]|0;if(!c){c=22;break}}if((c|0)==22)return b|0}else{b=0;c=a;b:while(1){while(1){h=+p[c>>3];j=+p[c+8>>3];c=c+16|0;l=f[c>>2]|0;l=(l|0)==0?a:l;g=+p[l>>3];e=+p[l+8>>3];if(h>g){i=h;h=j}else{i=g;g=h;h=e;e=j}if(!(k<g|k>i))break;c=f[c>>2]|0;if(!c){c=22;break b}}d=h==d|e==d?d+-2.220446049250313e-16:d;if(e+(k-g)/(i-g)*(h-e)>d)b=b^1;c=f[c>>2]|0;if(!c){c=22;break}}if((c|0)==22)return b|0}return 0}function ic(a,c,d,e,g){a=a|0;c=c|0;d=d|0;e=e|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;u=ea;ea=ea+32|0;t=u+16|0;s=u;h=Yc(a|0,c|0,52)|0;Z()|0;h=h&15;p=Yc(d|0,e|0,52)|0;Z()|0;if((h|0)!=(p&15|0)){t=1;ea=u;return t|0}l=Yc(a|0,c|0,45)|0;Z()|0;l=l&127;m=Yc(d|0,e|0,45)|0;Z()|0;m=m&127;p=(l|0)!=(m|0);if(p){j=Ea(l,m)|0;if((j|0)==7){t=2;ea=u;return t|0}k=Ea(m,l)|0;if((k|0)==7)$(22628,22652,147,22662);else{q=j;i=k}}else{q=0;i=0}n=ya(l)|0;o=ya(m)|0;f[t>>2]=0;f[t+4>>2]=0;f[t+8>>2]=0;f[t+12>>2]=0;do if(!q){Tb(d,e,t)|0;if((n|0)!=0&(o|0)!=0){if((m|0)!=(l|0))$(22780,22652,246,22662);i=Lb(a,c)|0;h=Lb(d,e)|0;if((b[22096+(i*7|0)+h>>0]|0)==0?(b[22032+(i*7|0)+h>>0]|0)==0:0){i=f[21200+(i*28|0)+(h<<2)>>2]|0;if((i|0)>0){j=t+4|0;h=0;do{Za(j);h=h+1|0}while((h|0)!=(i|0));r=55}else r=55}else h=5}else r=55}else{m=f[4304+(l*28|0)+(q<<2)>>2]|0;j=(m|0)>0;if(!o)if(j){l=0;k=d;j=e;do{k=Pb(k,j)|0;j=Z()|0;i=$a(i)|0;l=l+1|0}while((l|0)!=(m|0));m=i;l=k;k=j}else{m=i;l=d;k=e}else if(j){l=0;k=d;j=e;do{k=Ob(k,j)|0;j=Z()|0;i=$a(i)|0;if((i|0)==1)i=$a(1)|0;l=l+1|0}while((l|0)!=(m|0));m=i;l=k;k=j}else{m=i;l=d;k=e}Tb(l,k,t)|0;if(!p)$(22675,22652,177,22662);j=(n|0)!=0;i=(o|0)!=0;if(j&i)$(22702,22652,178,22662);if(!j)if(i){i=Lb(l,k)|0;if(Rb(h)|0?b[22096+(i*7|0)+m>>0]|0:0){h=4;break}if((Rb(h)|0)==0?b[22032+(i*7|0)+m>>0]|0:0){h=4;break}l=0;k=f[21200+(m*28|0)+(i<<2)>>2]|0;r=30}else i=0;else{i=Lb(a,c)|0;if(b[22096+(i*7|0)+q>>0]|0){h=3;break}if(b[22032+(i*7|0)+q>>0]|0){h=3;break}k=f[21200+(i*28|0)+(q<<2)>>2]|0;l=k;r=30}if((r|0)==30){if((k|0)<=-1)$(22733,22652,215,22662);if((l|0)<=-1)$(22756,22652,216,22662);if((k|0)>0){j=t+4|0;i=0;do{Za(j);i=i+1|0}while((i|0)!=(k|0));i=l}else i=l};f[s>>2]=0;f[s+4>>2]=0;f[s+8>>2]=0;Xa(s,q);if(h|0)while(1){if(!(Rb(h)|0))Wa(s);else Va(s);if((h|0)>1)h=h+-1|0;else break}if((i|0)>0){h=0;do{Za(s);h=h+1|0}while((h|0)!=(i|0))}r=t+4|0;Pa(r,s,r);Na(r);r=55}while(0);if((r|0)==55){h=t+4|0;f[g>>2]=f[h>>2];f[g+4>>2]=f[h+4>>2];f[g+8>>2]=f[h+8>>2];h=0}t=h;ea=u;return t|0}function jc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;p=ea;ea=ea+48|0;h=p+36|0;i=p+24|0;j=p+12|0;k=p;g=Yc(a|0,b|0,52)|0;Z()|0;g=g&15;n=Yc(a|0,b|0,45)|0;Z()|0;n=n&127;l=ya(n)|0;Zc(g|0,0,52)|0;r=Z()|0|134225919;q=d;f[q>>2]=-1;f[q+4>>2]=r;if(!g){if((f[c>>2]|0)>1){r=1;ea=p;return r|0}e=Da(n,Sa(c)|0)|0;if((e|0)==127){r=1;ea=p;return r|0}o=Zc(e|0,0,45)|0;q=Z()|0;n=d;q=f[n+4>>2]&-1040385|q;r=d;f[r>>2]=f[n>>2]|o;f[r+4>>2]=q;r=0;ea=p;return r|0};f[h>>2]=f[c>>2];f[h+4>>2]=f[c+4>>2];f[h+8>>2]=f[c+8>>2];while(1){f[i>>2]=f[h>>2];f[i+4>>2]=f[h+4>>2];f[i+8>>2]=f[h+8>>2];if(!(Rb(g)|0)){Ua(h);f[j>>2]=f[h>>2];f[j+4>>2]=f[h+4>>2];f[j+8>>2]=f[h+8>>2];Wa(j)}else{Ta(h);f[j>>2]=f[h>>2];f[j+4>>2]=f[h+4>>2];f[j+8>>2]=f[h+8>>2];Va(j)}Qa(i,j,k);Na(k);q=d;s=f[q>>2]|0;q=f[q+4>>2]|0;t=(15-g|0)*3|0;c=Zc(7,0,t|0)|0;q=q&~(Z()|0);t=Zc(Sa(k)|0,0,t|0)|0;q=Z()|0|q;r=d;f[r>>2]=t|s&~c;f[r+4>>2]=q;if((g|0)>1)g=g+-1|0;else break}a:do if(((f[h>>2]|0)<=1?(f[h+4>>2]|0)<=1:0)?(f[h+8>>2]|0)<=1:0){g=Sa(h)|0;i=Da(n,g)|0;if((i|0)==127)k=0;else k=ya(i)|0;b:do if(!g)if((l|0)!=0&(k|0)!=0){t=Lb(a,b)|0;g=d;g=21408+(t*28|0)+((Lb(f[g>>2]|0,f[g+4>>2]|0)|0)<<2)|0;g=f[g>>2]|0;if((g|0)<=-1)$(22904,22652,437,22837);if(!g){e=i;g=53}else{h=d;e=0;c=f[h>>2]|0;h=f[h+4>>2]|0;do{c=Nb(c,h)|0;h=Z()|0;t=d;f[t>>2]=c;f[t+4>>2]=h;e=e+1|0}while((e|0)<(g|0));e=i;g=52}}else{e=i;g=52}else{if(l){h=21408+((Lb(a,b)|0)*28|0)+(g<<2)|0;h=f[h>>2]|0;if((h|0)>0){c=0;do{g=_a(g)|0;c=c+1|0}while((c|0)!=(h|0))}if((g|0)==1){e=3;break a}c=Da(n,g)|0;if((c|0)==127)$(22807,22652,380,22837);if(!(ya(c)|0)){o=h;m=g;e=c}else $(22850,22652,381,22837)}else{o=0;m=g;e=i}j=f[4304+(n*28|0)+(m<<2)>>2]|0;if((j|0)<=-1)$(22881,22652,388,22837);if(!k){if((o|0)<=-1)$(22733,22652,421,22837);if(o|0){h=d;g=0;c=f[h>>2]|0;h=f[h+4>>2]|0;do{c=Nb(c,h)|0;h=Z()|0;t=d;f[t>>2]=c;f[t+4>>2]=h;g=g+1|0}while((g|0)<(o|0))}if((j|0)<=0){g=52;break}h=d;g=0;c=f[h>>2]|0;h=f[h+4>>2]|0;while(1){c=Nb(c,h)|0;h=Z()|0;t=d;f[t>>2]=c;f[t+4>>2]=h;g=g+1|0;if((g|0)==(j|0)){g=52;break b}}}i=Ea(e,n)|0;if((i|0)==7)$(22628,22652,397,22837);g=d;c=f[g>>2]|0;g=f[g+4>>2]|0;if((j|0)>0){h=0;do{c=Nb(c,g)|0;g=Z()|0;t=d;f[t>>2]=c;f[t+4>>2]=g;h=h+1|0}while((h|0)!=(j|0))}c=Lb(c,g)|0;t=za(e)|0;c=f[(t?21824:21616)+(i*28|0)+(c<<2)>>2]|0;if((c|0)<=-1)$(22733,22652,416,22837);if(!c)g=52;else{i=d;g=0;h=f[i>>2]|0;i=f[i+4>>2]|0;do{h=Mb(h,i)|0;i=Z()|0;t=d;f[t>>2]=h;f[t+4>>2]=i;g=g+1|0}while((g|0)<(c|0));g=52}}while(0);if((g|0)==52)if(k)g=53;if((g|0)==53){t=d;if((Lb(f[t>>2]|0,f[t+4>>2]|0)|0)==1){e=4;break}}t=d;r=f[t>>2]|0;t=f[t+4>>2]&-1040385;s=Zc(e|0,0,45)|0;t=t|(Z()|0);e=d;f[e>>2]=r|s;f[e+4>>2]=t;e=0}else e=2;while(0);t=e;ea=p;return t|0}function kc(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;g=ea;ea=ea+16|0;f=g;a=ic(a,b,c,d,f)|0;if(!a){db(f,e);a=0}ea=g;return a|0}function lc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=ea;ea=ea+16|0;f=e;eb(c,f);d=jc(a,b,f,d)|0;ea=e;return d|0}function mc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0;g=ea;ea=ea+32|0;e=g+12|0;f=g;if((ic(a,b,a,b,e)|0)==0?(ic(a,b,c,d,f)|0)==0:0)a=cb(e,f)|0;else a=-1;ea=g;return a|0}function nc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0;g=ea;ea=ea+32|0;e=g+12|0;f=g;if((ic(a,b,a,b,e)|0)==0?(ic(a,b,c,d,f)|0)==0:0)a=cb(e,f)|0;else a=-1;ea=g;return (a>>>31^1)+a|0}function oc(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var g=0,h=0,i=0.0,j=0.0,k=0,l=0,m=0,n=0,o=0.0,p=0.0,q=0.0,r=0,s=0,t=0,u=0,v=0,w=0,x=0.0;w=ea;ea=ea+48|0;g=w+24|0;h=w+12|0;v=w;if((ic(a,b,a,b,g)|0)==0?(ic(a,b,c,d,h)|0)==0:0){u=cb(g,h)|0;if((u|0)<0){v=u;ea=w;return v|0};f[g>>2]=0;f[g+4>>2]=0;f[g+8>>2]=0;f[h>>2]=0;f[h+4>>2]=0;f[h+8>>2]=0;ic(a,b,a,b,g)|0;ic(a,b,c,d,h)|0;fb(g);fb(h);if(!u){d=g+4|0;n=g+8|0;r=d;s=n;t=g;c=f[g>>2]|0;d=f[d>>2]|0;g=f[n>>2]|0;p=0.0;q=0.0;o=0.0}else{l=f[g>>2]|0;o=+(u|0);r=g+4|0;m=f[r>>2]|0;s=g+8|0;n=f[s>>2]|0;t=g;c=l;d=m;g=n;p=+((f[h>>2]|0)-l|0)/o;q=+((f[h+4>>2]|0)-m|0)/o;o=+((f[h+8>>2]|0)-n|0)/o}f[v>>2]=c;n=v+4|0;f[n>>2]=d;m=v+8|0;f[m>>2]=g;l=0;while(1){j=+(l|0);x=p*j+ +(c|0);i=q*j+ +(f[r>>2]|0);j=o*j+ +(f[s>>2]|0);d=~~+_c(+x);h=~~+_c(+i);c=~~+_c(+j);x=+F(+(+(d|0)-x));i=+F(+(+(h|0)-i));j=+F(+(+(c|0)-j));do if(!(x>i&x>j)){k=0-d|0;if(i>j){g=k-c|0;break}else{g=h;c=k-h|0;break}}else{d=0-(h+c)|0;g=h}while(0);f[v>>2]=d;f[n>>2]=g;f[m>>2]=c;gb(v);jc(a,b,v,e+(l<<3)|0)|0;if((l|0)==(u|0))break;l=l+1|0;c=f[t>>2]|0}v=0;ea=w;return v|0}v=-1;ea=w;return v|0}function pc(a,b){a=a|0;b=b|0;var c=0;if(!b){c=1;return c|0}c=a;a=1;do{a=S((b&1|0)==0?1:c,a)|0;b=b>>1;c=S(c,c)|0}while((b|0)!=0);return a|0}function qc(a,b,c){a=a|0;b=b|0;c=c|0;var d=0.0,e=0.0,g=0.0,h=0.0,i=0.0,j=0.0,k=0,l=0,m=0,n=0.0;if(!(Ja(b,c)|0)){m=0;return m|0}b=Ha(b)|0;n=+p[c>>3];d=+p[c+8>>3];d=b&d<0.0?d+6.283185307179586:d;m=f[a>>2]|0;if((m|0)<=0){m=0;return m|0}l=f[a+4>>2]|0;if(b){b=0;c=-1;a=0;a:while(1){k=a;while(1){h=+p[l+(k<<4)>>3];j=+p[l+(k<<4)+8>>3];a=(c+2|0)%(m|0)|0;g=+p[l+(a<<4)>>3];e=+p[l+(a<<4)+8>>3];if(h>g){i=h;h=j}else{i=g;g=h;h=e;e=j}if(!(n<g|n>i))break;c=k+1|0;if((c|0)<(m|0)){a=k;k=c;c=a}else{c=22;break a}}j=e<0.0?e+6.283185307179586:e;h=h<0.0?h+6.283185307179586:h;d=h==d|j==d?d+-2.220446049250313e-16:d;j=j+(n-g)/(i-g)*(h-j);if((j<0.0?j+6.283185307179586:j)>d)b=b^1;a=k+1|0;if((a|0)>=(m|0)){c=22;break}else c=k}if((c|0)==22)return b|0}else{b=0;c=-1;a=0;b:while(1){k=a;while(1){h=+p[l+(k<<4)>>3];j=+p[l+(k<<4)+8>>3];a=(c+2|0)%(m|0)|0;g=+p[l+(a<<4)>>3];e=+p[l+(a<<4)+8>>3];if(h>g){i=h;h=j}else{i=g;g=h;h=e;e=j}if(!(n<g|n>i))break;c=k+1|0;if((c|0)<(m|0)){a=k;k=c;c=a}else{c=22;break b}}d=h==d|e==d?d+-2.220446049250313e-16:d;if(e+(n-g)/(i-g)*(h-e)>d)b=b^1;a=k+1|0;if((a|0)>=(m|0)){c=22;break}else c=k}if((c|0)==22)return b|0}return 0}function rc(a,b){a=a|0;b=b|0;var c=0.0,d=0.0,e=0.0,g=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0,n=0,o=0,q=0,r=0,s=0,t=0,u=0;q=f[a>>2]|0;if(!q){f[b>>2]=0;f[b+4>>2]=0;f[b+8>>2]=0;f[b+12>>2]=0;f[b+16>>2]=0;f[b+20>>2]=0;f[b+24>>2]=0;f[b+28>>2]=0;return}r=b+8|0;p[r>>3]=1797693134862315708145274.0e284;s=b+24|0;p[s>>3]=1797693134862315708145274.0e284;p[b>>3]=-1797693134862315708145274.0e284;t=b+16|0;p[t>>3]=-1797693134862315708145274.0e284;if((q|0)<=0)return;n=f[a+4>>2]|0;k=1797693134862315708145274.0e284;l=-1797693134862315708145274.0e284;m=0;a=-1;g=1797693134862315708145274.0e284;h=1797693134862315708145274.0e284;j=-1797693134862315708145274.0e284;d=-1797693134862315708145274.0e284;o=0;while(1){c=+p[n+(o<<4)>>3];i=+p[n+(o<<4)+8>>3];a=a+2|0;e=+p[n+(((a|0)==(q|0)?0:a)<<4)+8>>3];if(c<g){p[r>>3]=c;g=c}if(i<h){p[s>>3]=i;h=i}if(c>j)p[b>>3]=c;else c=j;if(i>d){p[t>>3]=i;d=i}k=i>0.0&i<k?i:k;l=i<0.0&i>l?i:l;m=m|+F(+(i-e))>3.141592653589793;a=o+1|0;if((a|0)==(q|0))break;else{u=o;j=c;o=a;a=u}}if(!m)return;p[t>>3]=l;p[s>>3]=k;return}function sc(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0,n=0.0,o=0.0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;q=f[a>>2]|0;if(q){r=b+8|0;p[r>>3]=1797693134862315708145274.0e284;s=b+24|0;p[s>>3]=1797693134862315708145274.0e284;p[b>>3]=-1797693134862315708145274.0e284;t=b+16|0;p[t>>3]=-1797693134862315708145274.0e284;if((q|0)>0){e=f[a+4>>2]|0;n=1797693134862315708145274.0e284;o=-1797693134862315708145274.0e284;d=0;c=-1;j=1797693134862315708145274.0e284;k=1797693134862315708145274.0e284;m=-1797693134862315708145274.0e284;h=-1797693134862315708145274.0e284;u=0;while(1){g=+p[e+(u<<4)>>3];l=+p[e+(u<<4)+8>>3];y=c+2|0;i=+p[e+(((y|0)==(q|0)?0:y)<<4)+8>>3];if(g<j){p[r>>3]=g;j=g}if(l<k){p[s>>3]=l;k=l}if(g>m)p[b>>3]=g;else g=m;if(l>h){p[t>>3]=l;h=l}n=l>0.0&l<n?l:n;o=l<0.0&l>o?l:o;d=d|+F(+(l-i))>3.141592653589793;c=u+1|0;if((c|0)==(q|0))break;else{y=u;m=g;u=c;c=y}}if(d){p[t>>3]=o;p[s>>3]=n}}}else{f[b>>2]=0;f[b+4>>2]=0;f[b+8>>2]=0;f[b+12>>2]=0;f[b+16>>2]=0;f[b+20>>2]=0;f[b+24>>2]=0;f[b+28>>2]=0}y=a+8|0;c=f[y>>2]|0;if((c|0)<=0)return;x=a+12|0;w=0;do{e=f[x>>2]|0;d=w;w=w+1|0;s=b+(w<<5)|0;t=f[e+(d<<3)>>2]|0;if(t){u=b+(w<<5)+8|0;p[u>>3]=1797693134862315708145274.0e284;a=b+(w<<5)+24|0;p[a>>3]=1797693134862315708145274.0e284;p[s>>3]=-1797693134862315708145274.0e284;v=b+(w<<5)+16|0;p[v>>3]=-1797693134862315708145274.0e284;if((t|0)>0){q=f[e+(d<<3)+4>>2]|0;n=1797693134862315708145274.0e284;o=-1797693134862315708145274.0e284;e=0;d=-1;r=0;j=1797693134862315708145274.0e284;k=1797693134862315708145274.0e284;l=-1797693134862315708145274.0e284;h=-1797693134862315708145274.0e284;while(1){g=+p[q+(r<<4)>>3];m=+p[q+(r<<4)+8>>3];d=d+2|0;i=+p[q+(((d|0)==(t|0)?0:d)<<4)+8>>3];if(g<j){p[u>>3]=g;j=g}if(m<k){p[a>>3]=m;k=m}if(g>l)p[s>>3]=g;else g=l;if(m>h){p[v>>3]=m;h=m}n=m>0.0&m<n?m:n;o=m<0.0&m>o?m:o;e=e|+F(+(m-i))>3.141592653589793;d=r+1|0;if((d|0)==(t|0))break;else{z=r;r=d;l=g;d=z}}if(e){p[v>>3]=o;p[a>>3]=n}}}else{f[s>>2]=0;f[s+4>>2]=0;f[s+8>>2]=0;f[s+12>>2]=0;f[s+16>>2]=0;f[s+20>>2]=0;f[s+24>>2]=0;f[s+28>>2]=0;c=f[y>>2]|0}}while((w|0)<(c|0));return}function tc(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0;if(!(qc(a,b,c)|0)){e=0;return e|0}e=a+8|0;if((f[e>>2]|0)<=0){e=1;return e|0}d=a+12|0;a=0;while(1){g=a;a=a+1|0;if(qc((f[d>>2]|0)+(g<<3)|0,b+(a<<5)|0,c)|0){a=0;d=6;break}if((a|0)>=(f[e>>2]|0)){a=1;d=6;break}}if((d|0)==6)return a|0;return 0}function uc(){return 8}function vc(){return 16}function wc(){return 168}function xc(){return 8}function yc(){return 16}function zc(){return 12}function Ac(){return 8}function Bc(a){a=a|0;var b=0.0,c=0.0;c=+p[a>>3];b=+p[a+8>>3];return +(+G(+(c*c+b*b)))}function Cc(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0.0,g=0.0,h=0.0,i=0.0,j=0.0,k=0.0,l=0.0,m=0.0;j=+p[a>>3];i=+p[b>>3]-j;h=+p[a+8>>3];g=+p[b+8>>3]-h;l=+p[c>>3];f=+p[d>>3]-l;m=+p[c+8>>3];k=+p[d+8>>3]-m;f=(f*(h-m)-(j-l)*k)/(i*k-g*f);p[e>>3]=j+i*f;p[e+8>>3]=h+g*f;return}function Dc(a,b){a=a|0;b=b|0;if(!(+p[a>>3]==+p[b>>3])){b=0;return b|0}b=+p[a+8>>3]==+p[b+8>>3];return b|0}function Ec(a,b){a=a|0;b=b|0;var c=0.0,d=0.0,e=0.0;e=+p[a>>3]-+p[b>>3];d=+p[a+8>>3]-+p[b+8>>3];c=+p[a+16>>3]-+p[b+16>>3];return +(e*e+d*d+c*c)}function Fc(a,b){a=a|0;b=b|0;var c=0.0,d=0.0,e=0.0;c=+p[a>>3];d=+I(+c);c=+J(+c);p[b+16>>3]=c;c=+p[a+8>>3];e=d*+I(+c);p[b>>3]=e;c=d*+J(+c);p[b+8>>3]=c;return}function Gc(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;if((b|0)>0){d=Pc(b,4)|0;f[a>>2]=d;if(!d)$(22933,22956,37,22970)}else f[a>>2]=0;f[a+4>>2]=b;f[a+8>>2]=0;f[a+12>>2]=c;return}function Hc(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0;e=a+4|0;g=a+12|0;h=a+8|0;a:while(1){c=f[e>>2]|0;b=0;while(1){if((b|0)>=(c|0))break a;d=f[a>>2]|0;i=f[d+(b<<2)>>2]|0;if(!i)b=b+1|0;else break}b=d+(~~(+F(+(+H(10.0,+(+(15-(f[g>>2]|0)|0)))*(+p[i>>3]+ +p[i+8>>3])))%+(c|0))>>>0<<2)|0;c=f[b>>2]|0;b:do if(c|0){d=i+32|0;if((c|0)==(i|0))f[b>>2]=f[d>>2];else{c=c+32|0;b=f[c>>2]|0;if(!b)break;while(1){if((b|0)==(i|0))break;c=b+32|0;b=f[c>>2]|0;if(!b)break b}f[c>>2]=f[d>>2]}Oc(i);f[h>>2]=(f[h>>2]|0)+-1}while(0)}Oc(f[a>>2]|0);return}function Ic(a){a=a|0;var b=0,c=0,d=0;d=f[a+4>>2]|0;c=0;while(1){if((c|0)>=(d|0)){b=0;c=4;break}b=f[(f[a>>2]|0)+(c<<2)>>2]|0;if(!b)c=c+1|0;else{c=4;break}}if((c|0)==4)return b|0;return 0}function Jc(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,g=0;c=~~(+F(+(+H(10.0,+(+(15-(f[a+12>>2]|0)|0)))*(+p[b>>3]+ +p[b+8>>3])))%+(f[a+4>>2]|0))>>>0;c=(f[a>>2]|0)+(c<<2)|0;d=f[c>>2]|0;if(!d){g=1;return g|0}g=b+32|0;do if((d|0)!=(b|0)){c=f[d+32>>2]|0;if(!c){g=1;return g|0}e=c;while(1){if((e|0)==(b|0)){e=8;break}c=f[e+32>>2]|0;if(!c){c=1;e=10;break}else{d=e;e=c}}if((e|0)==8){f[d+32>>2]=f[g>>2];break}else if((e|0)==10)return c|0}else f[c>>2]=f[g>>2];while(0);Oc(b);g=a+8|0;f[g>>2]=(f[g>>2]|0)+-1;g=0;return g|0}function Kc(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,g=0,h=0;g=Nc(40)|0;if(!g)$(22986,22956,95,22999);f[g>>2]=f[b>>2];f[g+4>>2]=f[b+4>>2];f[g+8>>2]=f[b+8>>2];f[g+12>>2]=f[b+12>>2];e=g+16|0;f[e>>2]=f[c>>2];f[e+4>>2]=f[c+4>>2];f[e+8>>2]=f[c+8>>2];f[e+12>>2]=f[c+12>>2];f[g+32>>2]=0;e=~~(+F(+(+H(10.0,+(+(15-(f[a+12>>2]|0)|0)))*(+p[b>>3]+ +p[b+8>>3])))%+(f[a+4>>2]|0))>>>0;e=(f[a>>2]|0)+(e<<2)|0;d=f[e>>2]|0;do if(!d)f[e>>2]=g;else{while(1){if(qb(d,b)|0?qb(d+16|0,c)|0:0)break;e=f[d+32>>2]|0;d=(e|0)==0?d:e;if(!(f[d+32>>2]|0)){h=10;break}}if((h|0)==10){f[d+32>>2]=g;break}Oc(g);h=d;return h|0}while(0);h=a+8|0;f[h>>2]=(f[h>>2]|0)+1;h=g;return h|0}function Lc(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;e=~~(+F(+(+H(10.0,+(+(15-(f[a+12>>2]|0)|0)))*(+p[b>>3]+ +p[b+8>>3])))%+(f[a+4>>2]|0))>>>0;e=f[(f[a>>2]|0)+(e<<2)>>2]|0;if(!e){c=0;return c|0}if(!c){a=e;while(1){if(qb(a,b)|0){d=10;break}a=f[a+32>>2]|0;if(!a){a=0;d=10;break}}if((d|0)==10)return a|0}a=e;while(1){if(qb(a,b)|0?qb(a+16|0,c)|0:0){d=10;break}a=f[a+32>>2]|0;if(!a){a=0;d=10;break}}if((d|0)==10)return a|0;return 0}function Mc(a,b){a=a|0;b=b|0;var c=0;c=~~(+F(+(+H(10.0,+(+(15-(f[a+12>>2]|0)|0)))*(+p[b>>3]+ +p[b+8>>3])))%+(f[a+4>>2]|0))>>>0;a=f[(f[a>>2]|0)+(c<<2)>>2]|0;if(!a){c=0;return c|0}while(1){if(qb(a,b)|0){b=5;break}a=f[a+32>>2]|0;if(!a){a=0;b=5;break}}if((b|0)==5)return a|0;return 0}function Nc(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;w=ea;ea=ea+16|0;n=w;do if(a>>>0<245){k=a>>>0<11?16:a+11&-8;a=k>>>3;m=f[5756]|0;c=m>>>a;if(c&3|0){b=(c&1^1)+a|0;a=23064+(b<<1<<2)|0;c=a+8|0;d=f[c>>2]|0;e=d+8|0;g=f[e>>2]|0;if((g|0)==(a|0))f[5756]=m&~(1<<b);else{f[g+12>>2]=a;f[c>>2]=g}v=b<<3;f[d+4>>2]=v|3;v=d+v+4|0;f[v>>2]=f[v>>2]|1;v=e;ea=w;return v|0}l=f[5758]|0;if(k>>>0>l>>>0){if(c|0){b=2<<a;b=c<<a&(b|0-b);b=(b&0-b)+-1|0;i=b>>>12&16;b=b>>>i;c=b>>>5&8;b=b>>>c;g=b>>>2&4;b=b>>>g;a=b>>>1&2;b=b>>>a;d=b>>>1&1;d=(c|i|g|a|d)+(b>>>d)|0;b=23064+(d<<1<<2)|0;a=b+8|0;g=f[a>>2]|0;i=g+8|0;c=f[i>>2]|0;if((c|0)==(b|0)){a=m&~(1<<d);f[5756]=a}else{f[c+12>>2]=b;f[a>>2]=c;a=m}v=d<<3;h=v-k|0;f[g+4>>2]=k|3;e=g+k|0;f[e+4>>2]=h|1;f[g+v>>2]=h;if(l|0){d=f[5761]|0;b=l>>>3;c=23064+(b<<1<<2)|0;b=1<<b;if(!(a&b)){f[5756]=a|b;b=c;a=c+8|0}else{a=c+8|0;b=f[a>>2]|0}f[a>>2]=d;f[b+12>>2]=d;f[d+8>>2]=b;f[d+12>>2]=c}f[5758]=h;f[5761]=e;v=i;ea=w;return v|0}g=f[5757]|0;if(g){c=(g&0-g)+-1|0;e=c>>>12&16;c=c>>>e;d=c>>>5&8;c=c>>>d;h=c>>>2&4;c=c>>>h;i=c>>>1&2;c=c>>>i;j=c>>>1&1;j=f[23328+((d|e|h|i|j)+(c>>>j)<<2)>>2]|0;c=j;i=j;j=(f[j+4>>2]&-8)-k|0;while(1){a=f[c+16>>2]|0;if(!a){a=f[c+20>>2]|0;if(!a)break}h=(f[a+4>>2]&-8)-k|0;e=h>>>0<j>>>0;c=a;i=e?a:i;j=e?h:j}h=i+k|0;if(h>>>0>i>>>0){e=f[i+24>>2]|0;b=f[i+12>>2]|0;do if((b|0)==(i|0)){a=i+20|0;b=f[a>>2]|0;if(!b){a=i+16|0;b=f[a>>2]|0;if(!b){c=0;break}}while(1){d=b+20|0;c=f[d>>2]|0;if(!c){d=b+16|0;c=f[d>>2]|0;if(!c)break;else{b=c;a=d}}else{b=c;a=d}}f[a>>2]=0;c=b}else{c=f[i+8>>2]|0;f[c+12>>2]=b;f[b+8>>2]=c;c=b}while(0);do if(e|0){b=f[i+28>>2]|0;a=23328+(b<<2)|0;if((i|0)==(f[a>>2]|0)){f[a>>2]=c;if(!c){f[5757]=g&~(1<<b);break}}else{v=e+16|0;f[((f[v>>2]|0)==(i|0)?v:e+20|0)>>2]=c;if(!c)break}f[c+24>>2]=e;b=f[i+16>>2]|0;if(b|0){f[c+16>>2]=b;f[b+24>>2]=c}b=f[i+20>>2]|0;if(b|0){f[c+20>>2]=b;f[b+24>>2]=c}}while(0);if(j>>>0<16){v=j+k|0;f[i+4>>2]=v|3;v=i+v+4|0;f[v>>2]=f[v>>2]|1}else{f[i+4>>2]=k|3;f[h+4>>2]=j|1;f[h+j>>2]=j;if(l|0){d=f[5761]|0;b=l>>>3;c=23064+(b<<1<<2)|0;b=1<<b;if(!(b&m)){f[5756]=b|m;b=c;a=c+8|0}else{a=c+8|0;b=f[a>>2]|0}f[a>>2]=d;f[b+12>>2]=d;f[d+8>>2]=b;f[d+12>>2]=c}f[5758]=j;f[5761]=h}v=i+8|0;ea=w;return v|0}else m=k}else m=k}else m=k}else if(a>>>0<=4294967231){a=a+11|0;k=a&-8;d=f[5757]|0;if(d){e=0-k|0;a=a>>>8;if(a)if(k>>>0>16777215)j=31;else{m=(a+1048320|0)>>>16&8;q=a<<m;i=(q+520192|0)>>>16&4;q=q<<i;j=(q+245760|0)>>>16&2;j=14-(i|m|j)+(q<<j>>>15)|0;j=k>>>(j+7|0)&1|j<<1}else j=0;c=f[23328+(j<<2)>>2]|0;a:do if(!c){c=0;a=0;q=61}else{a=0;i=k<<((j|0)==31?0:25-(j>>>1)|0);g=0;while(1){h=(f[c+4>>2]&-8)-k|0;if(h>>>0<e>>>0)if(!h){a=c;e=0;q=65;break a}else{a=c;e=h}q=f[c+20>>2]|0;c=f[c+16+(i>>>31<<2)>>2]|0;g=(q|0)==0|(q|0)==(c|0)?g:q;if(!c){c=g;q=61;break}else i=i<<1}}while(0);if((q|0)==61){if((c|0)==0&(a|0)==0){a=2<<j;a=(a|0-a)&d;if(!a){m=k;break}m=(a&0-a)+-1|0;h=m>>>12&16;m=m>>>h;g=m>>>5&8;m=m>>>g;i=m>>>2&4;m=m>>>i;j=m>>>1&2;m=m>>>j;c=m>>>1&1;a=0;c=f[23328+((g|h|i|j|c)+(m>>>c)<<2)>>2]|0}if(!c){i=a;h=e}else q=65}if((q|0)==65){g=c;while(1){m=(f[g+4>>2]&-8)-k|0;c=m>>>0<e>>>0;e=c?m:e;a=c?g:a;c=f[g+16>>2]|0;if(!c)c=f[g+20>>2]|0;if(!c){i=a;h=e;break}else g=c}}if(((i|0)!=0?h>>>0<((f[5758]|0)-k|0)>>>0:0)?(l=i+k|0,l>>>0>i>>>0):0){g=f[i+24>>2]|0;b=f[i+12>>2]|0;do if((b|0)==(i|0)){a=i+20|0;b=f[a>>2]|0;if(!b){a=i+16|0;b=f[a>>2]|0;if(!b){b=0;break}}while(1){e=b+20|0;c=f[e>>2]|0;if(!c){e=b+16|0;c=f[e>>2]|0;if(!c)break;else{b=c;a=e}}else{b=c;a=e}}f[a>>2]=0}else{v=f[i+8>>2]|0;f[v+12>>2]=b;f[b+8>>2]=v}while(0);do if(g){a=f[i+28>>2]|0;c=23328+(a<<2)|0;if((i|0)==(f[c>>2]|0)){f[c>>2]=b;if(!b){d=d&~(1<<a);f[5757]=d;break}}else{v=g+16|0;f[((f[v>>2]|0)==(i|0)?v:g+20|0)>>2]=b;if(!b)break}f[b+24>>2]=g;a=f[i+16>>2]|0;if(a|0){f[b+16>>2]=a;f[a+24>>2]=b}a=f[i+20>>2]|0;if(a){f[b+20>>2]=a;f[a+24>>2]=b}}while(0);b:do if(h>>>0<16){v=h+k|0;f[i+4>>2]=v|3;v=i+v+4|0;f[v>>2]=f[v>>2]|1}else{f[i+4>>2]=k|3;f[l+4>>2]=h|1;f[l+h>>2]=h;b=h>>>3;if(h>>>0<256){c=23064+(b<<1<<2)|0;a=f[5756]|0;b=1<<b;if(!(a&b)){f[5756]=a|b;b=c;a=c+8|0}else{a=c+8|0;b=f[a>>2]|0}f[a>>2]=l;f[b+12>>2]=l;f[l+8>>2]=b;f[l+12>>2]=c;break}b=h>>>8;if(b)if(h>>>0>16777215)c=31;else{u=(b+1048320|0)>>>16&8;v=b<<u;t=(v+520192|0)>>>16&4;v=v<<t;c=(v+245760|0)>>>16&2;c=14-(t|u|c)+(v<<c>>>15)|0;c=h>>>(c+7|0)&1|c<<1}else c=0;b=23328+(c<<2)|0;f[l+28>>2]=c;a=l+16|0;f[a+4>>2]=0;f[a>>2]=0;a=1<<c;if(!(d&a)){f[5757]=d|a;f[b>>2]=l;f[l+24>>2]=b;f[l+12>>2]=l;f[l+8>>2]=l;break}b=f[b>>2]|0;c:do if((f[b+4>>2]&-8|0)!=(h|0)){d=h<<((c|0)==31?0:25-(c>>>1)|0);while(1){c=b+16+(d>>>31<<2)|0;a=f[c>>2]|0;if(!a)break;if((f[a+4>>2]&-8|0)==(h|0)){b=a;break c}else{d=d<<1;b=a}}f[c>>2]=l;f[l+24>>2]=b;f[l+12>>2]=l;f[l+8>>2]=l;break b}while(0);u=b+8|0;v=f[u>>2]|0;f[v+12>>2]=l;f[u>>2]=l;f[l+8>>2]=v;f[l+12>>2]=b;f[l+24>>2]=0}while(0);v=i+8|0;ea=w;return v|0}else m=k}else m=k}else m=-1;while(0);c=f[5758]|0;if(c>>>0>=m>>>0){b=c-m|0;a=f[5761]|0;if(b>>>0>15){v=a+m|0;f[5761]=v;f[5758]=b;f[v+4>>2]=b|1;f[a+c>>2]=b;f[a+4>>2]=m|3}else{f[5758]=0;f[5761]=0;f[a+4>>2]=c|3;v=a+c+4|0;f[v>>2]=f[v>>2]|1}v=a+8|0;ea=w;return v|0}h=f[5759]|0;if(h>>>0>m>>>0){t=h-m|0;f[5759]=t;v=f[5762]|0;u=v+m|0;f[5762]=u;f[u+4>>2]=t|1;f[v+4>>2]=m|3;v=v+8|0;ea=w;return v|0}if(!(f[5874]|0)){f[5876]=4096;f[5875]=4096;f[5877]=-1;f[5878]=-1;f[5879]=0;f[5867]=0;f[5874]=n&-16^1431655768;a=4096}else a=f[5876]|0;i=m+48|0;j=m+47|0;g=a+j|0;e=0-a|0;k=g&e;if(k>>>0<=m>>>0){v=0;ea=w;return v|0}a=f[5866]|0;if(a|0?(l=f[5864]|0,n=l+k|0,n>>>0<=l>>>0|n>>>0>a>>>0):0){v=0;ea=w;return v|0}d:do if(!(f[5867]&4)){c=f[5762]|0;e:do if(c){d=23472;while(1){n=f[d>>2]|0;if(n>>>0<=c>>>0?(n+(f[d+4>>2]|0)|0)>>>0>c>>>0:0)break;a=f[d+8>>2]|0;if(!a){q=128;break e}else d=a}b=g-h&e;if(b>>>0<2147483647){a=cd(b|0)|0;if((a|0)==((f[d>>2]|0)+(f[d+4>>2]|0)|0)){if((a|0)!=(-1|0)){h=b;g=a;q=145;break d}}else{d=a;q=136}}else b=0}else q=128;while(0);do if((q|0)==128){c=cd(0)|0;if((c|0)!=(-1|0)?(b=c,o=f[5875]|0,p=o+-1|0,b=((p&b|0)==0?0:(p+b&0-o)-b|0)+k|0,o=f[5864]|0,p=b+o|0,b>>>0>m>>>0&b>>>0<2147483647):0){n=f[5866]|0;if(n|0?p>>>0<=o>>>0|p>>>0>n>>>0:0){b=0;break}a=cd(b|0)|0;if((a|0)==(c|0)){h=b;g=c;q=145;break d}else{d=a;q=136}}else b=0}while(0);do if((q|0)==136){c=0-b|0;if(!(i>>>0>b>>>0&(b>>>0<2147483647&(d|0)!=(-1|0))))if((d|0)==(-1|0)){b=0;break}else{h=b;g=d;q=145;break d}a=f[5876]|0;a=j-b+a&0-a;if(a>>>0>=2147483647){h=b;g=d;q=145;break d}if((cd(a|0)|0)==(-1|0)){cd(c|0)|0;b=0;break}else{h=a+b|0;g=d;q=145;break d}}while(0);f[5867]=f[5867]|4;q=143}else{b=0;q=143}while(0);if(((q|0)==143?k>>>0<2147483647:0)?(t=cd(k|0)|0,p=cd(0)|0,r=p-t|0,s=r>>>0>(m+40|0)>>>0,!((t|0)==(-1|0)|s^1|t>>>0<p>>>0&((t|0)!=(-1|0)&(p|0)!=(-1|0))^1)):0){h=s?r:b;g=t;q=145}if((q|0)==145){b=(f[5864]|0)+h|0;f[5864]=b;if(b>>>0>(f[5865]|0)>>>0)f[5865]=b;j=f[5762]|0;f:do if(j){b=23472;while(1){a=f[b>>2]|0;c=f[b+4>>2]|0;if((g|0)==(a+c|0)){q=154;break}d=f[b+8>>2]|0;if(!d)break;else b=d}if(((q|0)==154?(u=b+4|0,(f[b+12>>2]&8|0)==0):0)?g>>>0>j>>>0&a>>>0<=j>>>0:0){f[u>>2]=c+h;v=(f[5759]|0)+h|0;t=j+8|0;t=(t&7|0)==0?0:0-t&7;u=j+t|0;t=v-t|0;f[5762]=u;f[5759]=t;f[u+4>>2]=t|1;f[j+v+4>>2]=40;f[5763]=f[5878];break}if(g>>>0<(f[5760]|0)>>>0)f[5760]=g;c=g+h|0;b=23472;while(1){if((f[b>>2]|0)==(c|0)){q=162;break}a=f[b+8>>2]|0;if(!a)break;else b=a}if((q|0)==162?(f[b+12>>2]&8|0)==0:0){f[b>>2]=g;l=b+4|0;f[l>>2]=(f[l>>2]|0)+h;l=g+8|0;l=g+((l&7|0)==0?0:0-l&7)|0;b=c+8|0;b=c+((b&7|0)==0?0:0-b&7)|0;k=l+m|0;i=b-l-m|0;f[l+4>>2]=m|3;g:do if((j|0)==(b|0)){v=(f[5759]|0)+i|0;f[5759]=v;f[5762]=k;f[k+4>>2]=v|1}else{if((f[5761]|0)==(b|0)){v=(f[5758]|0)+i|0;f[5758]=v;f[5761]=k;f[k+4>>2]=v|1;f[k+v>>2]=v;break}a=f[b+4>>2]|0;if((a&3|0)==1){h=a&-8;d=a>>>3;h:do if(a>>>0<256){a=f[b+8>>2]|0;c=f[b+12>>2]|0;if((c|0)==(a|0)){f[5756]=f[5756]&~(1<<d);break}else{f[a+12>>2]=c;f[c+8>>2]=a;break}}else{g=f[b+24>>2]|0;a=f[b+12>>2]|0;do if((a|0)==(b|0)){c=b+16|0;d=c+4|0;a=f[d>>2]|0;if(!a){a=f[c>>2]|0;if(!a){a=0;break}}else c=d;while(1){e=a+20|0;d=f[e>>2]|0;if(!d){e=a+16|0;d=f[e>>2]|0;if(!d)break;else{a=d;c=e}}else{a=d;c=e}}f[c>>2]=0}else{v=f[b+8>>2]|0;f[v+12>>2]=a;f[a+8>>2]=v}while(0);if(!g)break;c=f[b+28>>2]|0;d=23328+(c<<2)|0;do if((f[d>>2]|0)!=(b|0)){v=g+16|0;f[((f[v>>2]|0)==(b|0)?v:g+20|0)>>2]=a;if(!a)break h}else{f[d>>2]=a;if(a|0)break;f[5757]=f[5757]&~(1<<c);break h}while(0);f[a+24>>2]=g;c=b+16|0;d=f[c>>2]|0;if(d|0){f[a+16>>2]=d;f[d+24>>2]=a}c=f[c+4>>2]|0;if(!c)break;f[a+20>>2]=c;f[c+24>>2]=a}while(0);b=b+h|0;e=h+i|0}else e=i;b=b+4|0;f[b>>2]=f[b>>2]&-2;f[k+4>>2]=e|1;f[k+e>>2]=e;b=e>>>3;if(e>>>0<256){c=23064+(b<<1<<2)|0;a=f[5756]|0;b=1<<b;if(!(a&b)){f[5756]=a|b;b=c;a=c+8|0}else{a=c+8|0;b=f[a>>2]|0}f[a>>2]=k;f[b+12>>2]=k;f[k+8>>2]=b;f[k+12>>2]=c;break}b=e>>>8;do if(!b)d=0;else{if(e>>>0>16777215){d=31;break}u=(b+1048320|0)>>>16&8;v=b<<u;t=(v+520192|0)>>>16&4;v=v<<t;d=(v+245760|0)>>>16&2;d=14-(t|u|d)+(v<<d>>>15)|0;d=e>>>(d+7|0)&1|d<<1}while(0);b=23328+(d<<2)|0;f[k+28>>2]=d;a=k+16|0;f[a+4>>2]=0;f[a>>2]=0;a=f[5757]|0;c=1<<d;if(!(a&c)){f[5757]=a|c;f[b>>2]=k;f[k+24>>2]=b;f[k+12>>2]=k;f[k+8>>2]=k;break}b=f[b>>2]|0;i:do if((f[b+4>>2]&-8|0)!=(e|0)){d=e<<((d|0)==31?0:25-(d>>>1)|0);while(1){c=b+16+(d>>>31<<2)|0;a=f[c>>2]|0;if(!a)break;if((f[a+4>>2]&-8|0)==(e|0)){b=a;break i}else{d=d<<1;b=a}}f[c>>2]=k;f[k+24>>2]=b;f[k+12>>2]=k;f[k+8>>2]=k;break g}while(0);u=b+8|0;v=f[u>>2]|0;f[v+12>>2]=k;f[u>>2]=k;f[k+8>>2]=v;f[k+12>>2]=b;f[k+24>>2]=0}while(0);v=l+8|0;ea=w;return v|0}b=23472;while(1){a=f[b>>2]|0;if(a>>>0<=j>>>0?(v=a+(f[b+4>>2]|0)|0,v>>>0>j>>>0):0)break;b=f[b+8>>2]|0}e=v+-47|0;a=e+8|0;a=e+((a&7|0)==0?0:0-a&7)|0;e=j+16|0;a=a>>>0<e>>>0?j:a;b=a+8|0;c=h+-40|0;t=g+8|0;t=(t&7|0)==0?0:0-t&7;u=g+t|0;t=c-t|0;f[5762]=u;f[5759]=t;f[u+4>>2]=t|1;f[g+c+4>>2]=40;f[5763]=f[5878];c=a+4|0;f[c>>2]=27;f[b>>2]=f[5868];f[b+4>>2]=f[5869];f[b+8>>2]=f[5870];f[b+12>>2]=f[5871];f[5868]=g;f[5869]=h;f[5871]=0;f[5870]=b;b=a+24|0;do{u=b;b=b+4|0;f[b>>2]=7}while((u+8|0)>>>0<v>>>0);if((a|0)!=(j|0)){g=a-j|0;f[c>>2]=f[c>>2]&-2;f[j+4>>2]=g|1;f[a>>2]=g;b=g>>>3;if(g>>>0<256){c=23064+(b<<1<<2)|0;a=f[5756]|0;b=1<<b;if(!(a&b)){f[5756]=a|b;b=c;a=c+8|0}else{a=c+8|0;b=f[a>>2]|0}f[a>>2]=j;f[b+12>>2]=j;f[j+8>>2]=b;f[j+12>>2]=c;break}b=g>>>8;if(b)if(g>>>0>16777215)d=31;else{u=(b+1048320|0)>>>16&8;v=b<<u;t=(v+520192|0)>>>16&4;v=v<<t;d=(v+245760|0)>>>16&2;d=14-(t|u|d)+(v<<d>>>15)|0;d=g>>>(d+7|0)&1|d<<1}else d=0;c=23328+(d<<2)|0;f[j+28>>2]=d;f[j+20>>2]=0;f[e>>2]=0;b=f[5757]|0;a=1<<d;if(!(b&a)){f[5757]=b|a;f[c>>2]=j;f[j+24>>2]=c;f[j+12>>2]=j;f[j+8>>2]=j;break}b=f[c>>2]|0;j:do if((f[b+4>>2]&-8|0)!=(g|0)){d=g<<((d|0)==31?0:25-(d>>>1)|0);while(1){c=b+16+(d>>>31<<2)|0;a=f[c>>2]|0;if(!a)break;if((f[a+4>>2]&-8|0)==(g|0)){b=a;break j}else{d=d<<1;b=a}}f[c>>2]=j;f[j+24>>2]=b;f[j+12>>2]=j;f[j+8>>2]=j;break f}while(0);u=b+8|0;v=f[u>>2]|0;f[v+12>>2]=j;f[u>>2]=j;f[j+8>>2]=v;f[j+12>>2]=b;f[j+24>>2]=0}}else{v=f[5760]|0;if((v|0)==0|g>>>0<v>>>0)f[5760]=g;f[5868]=g;f[5869]=h;f[5871]=0;f[5765]=f[5874];f[5764]=-1;f[5769]=23064;f[5768]=23064;f[5771]=23072;f[5770]=23072;f[5773]=23080;f[5772]=23080;f[5775]=23088;f[5774]=23088;f[5777]=23096;f[5776]=23096;f[5779]=23104;f[5778]=23104;f[5781]=23112;f[5780]=23112;f[5783]=23120;f[5782]=23120;f[5785]=23128;f[5784]=23128;f[5787]=23136;f[5786]=23136;f[5789]=23144;f[5788]=23144;f[5791]=23152;f[5790]=23152;f[5793]=23160;f[5792]=23160;f[5795]=23168;f[5794]=23168;f[5797]=23176;f[5796]=23176;f[5799]=23184;f[5798]=23184;f[5801]=23192;f[5800]=23192;f[5803]=23200;f[5802]=23200;f[5805]=23208;f[5804]=23208;f[5807]=23216;f[5806]=23216;f[5809]=23224;f[5808]=23224;f[5811]=23232;f[5810]=23232;f[5813]=23240;f[5812]=23240;f[5815]=23248;f[5814]=23248;f[5817]=23256;f[5816]=23256;f[5819]=23264;f[5818]=23264;f[5821]=23272;f[5820]=23272;f[5823]=23280;f[5822]=23280;f[5825]=23288;f[5824]=23288;f[5827]=23296;f[5826]=23296;f[5829]=23304;f[5828]=23304;f[5831]=23312;f[5830]=23312;v=h+-40|0;t=g+8|0;t=(t&7|0)==0?0:0-t&7;u=g+t|0;t=v-t|0;f[5762]=u;f[5759]=t;f[u+4>>2]=t|1;f[g+v+4>>2]=40;f[5763]=f[5878]}while(0);b=f[5759]|0;if(b>>>0>m>>>0){t=b-m|0;f[5759]=t;v=f[5762]|0;u=v+m|0;f[5762]=u;f[u+4>>2]=t|1;f[v+4>>2]=m|3;v=v+8|0;ea=w;return v|0}}v=Qc()|0;f[v>>2]=12;v=0;ea=w;return v|0}function Oc(a){a=a|0;var b=0,c=0,d=0,e=0,g=0,h=0,i=0,j=0;if(!a)return;c=a+-8|0;e=f[5760]|0;a=f[a+-4>>2]|0;b=a&-8;j=c+b|0;do if(!(a&1)){d=f[c>>2]|0;if(!(a&3))return;h=c+(0-d)|0;g=d+b|0;if(h>>>0<e>>>0)return;if((f[5761]|0)==(h|0)){a=j+4|0;b=f[a>>2]|0;if((b&3|0)!=3){i=h;b=g;break}f[5758]=g;f[a>>2]=b&-2;f[h+4>>2]=g|1;f[h+g>>2]=g;return}c=d>>>3;if(d>>>0<256){a=f[h+8>>2]|0;b=f[h+12>>2]|0;if((b|0)==(a|0)){f[5756]=f[5756]&~(1<<c);i=h;b=g;break}else{f[a+12>>2]=b;f[b+8>>2]=a;i=h;b=g;break}}e=f[h+24>>2]|0;a=f[h+12>>2]|0;do if((a|0)==(h|0)){b=h+16|0;c=b+4|0;a=f[c>>2]|0;if(!a){a=f[b>>2]|0;if(!a){a=0;break}}else b=c;while(1){d=a+20|0;c=f[d>>2]|0;if(!c){d=a+16|0;c=f[d>>2]|0;if(!c)break;else{a=c;b=d}}else{a=c;b=d}}f[b>>2]=0}else{i=f[h+8>>2]|0;f[i+12>>2]=a;f[a+8>>2]=i}while(0);if(e){b=f[h+28>>2]|0;c=23328+(b<<2)|0;if((f[c>>2]|0)==(h|0)){f[c>>2]=a;if(!a){f[5757]=f[5757]&~(1<<b);i=h;b=g;break}}else{i=e+16|0;f[((f[i>>2]|0)==(h|0)?i:e+20|0)>>2]=a;if(!a){i=h;b=g;break}}f[a+24>>2]=e;b=h+16|0;c=f[b>>2]|0;if(c|0){f[a+16>>2]=c;f[c+24>>2]=a}b=f[b+4>>2]|0;if(b){f[a+20>>2]=b;f[b+24>>2]=a;i=h;b=g}else{i=h;b=g}}else{i=h;b=g}}else{i=c;h=c}while(0);if(h>>>0>=j>>>0)return;a=j+4|0;d=f[a>>2]|0;if(!(d&1))return;if(!(d&2)){if((f[5762]|0)==(j|0)){j=(f[5759]|0)+b|0;f[5759]=j;f[5762]=i;f[i+4>>2]=j|1;if((i|0)!=(f[5761]|0))return;f[5761]=0;f[5758]=0;return}if((f[5761]|0)==(j|0)){j=(f[5758]|0)+b|0;f[5758]=j;f[5761]=h;f[i+4>>2]=j|1;f[h+j>>2]=j;return}e=(d&-8)+b|0;c=d>>>3;do if(d>>>0<256){b=f[j+8>>2]|0;a=f[j+12>>2]|0;if((a|0)==(b|0)){f[5756]=f[5756]&~(1<<c);break}else{f[b+12>>2]=a;f[a+8>>2]=b;break}}else{g=f[j+24>>2]|0;a=f[j+12>>2]|0;do if((a|0)==(j|0)){b=j+16|0;c=b+4|0;a=f[c>>2]|0;if(!a){a=f[b>>2]|0;if(!a){c=0;break}}else b=c;while(1){d=a+20|0;c=f[d>>2]|0;if(!c){d=a+16|0;c=f[d>>2]|0;if(!c)break;else{a=c;b=d}}else{a=c;b=d}}f[b>>2]=0;c=a}else{c=f[j+8>>2]|0;f[c+12>>2]=a;f[a+8>>2]=c;c=a}while(0);if(g|0){a=f[j+28>>2]|0;b=23328+(a<<2)|0;if((f[b>>2]|0)==(j|0)){f[b>>2]=c;if(!c){f[5757]=f[5757]&~(1<<a);break}}else{d=g+16|0;f[((f[d>>2]|0)==(j|0)?d:g+20|0)>>2]=c;if(!c)break}f[c+24>>2]=g;a=j+16|0;b=f[a>>2]|0;if(b|0){f[c+16>>2]=b;f[b+24>>2]=c}a=f[a+4>>2]|0;if(a|0){f[c+20>>2]=a;f[a+24>>2]=c}}}while(0);f[i+4>>2]=e|1;f[h+e>>2]=e;if((i|0)==(f[5761]|0)){f[5758]=e;return}}else{f[a>>2]=d&-2;f[i+4>>2]=b|1;f[h+b>>2]=b;e=b}a=e>>>3;if(e>>>0<256){c=23064+(a<<1<<2)|0;b=f[5756]|0;a=1<<a;if(!(b&a)){f[5756]=b|a;a=c;b=c+8|0}else{b=c+8|0;a=f[b>>2]|0}f[b>>2]=i;f[a+12>>2]=i;f[i+8>>2]=a;f[i+12>>2]=c;return}a=e>>>8;if(a)if(e>>>0>16777215)d=31;else{h=(a+1048320|0)>>>16&8;j=a<<h;g=(j+520192|0)>>>16&4;j=j<<g;d=(j+245760|0)>>>16&2;d=14-(g|h|d)+(j<<d>>>15)|0;d=e>>>(d+7|0)&1|d<<1}else d=0;a=23328+(d<<2)|0;f[i+28>>2]=d;f[i+20>>2]=0;f[i+16>>2]=0;b=f[5757]|0;c=1<<d;a:do if(!(b&c)){f[5757]=b|c;f[a>>2]=i;f[i+24>>2]=a;f[i+12>>2]=i;f[i+8>>2]=i}else{a=f[a>>2]|0;b:do if((f[a+4>>2]&-8|0)!=(e|0)){d=e<<((d|0)==31?0:25-(d>>>1)|0);while(1){c=a+16+(d>>>31<<2)|0;b=f[c>>2]|0;if(!b)break;if((f[b+4>>2]&-8|0)==(e|0)){a=b;break b}else{d=d<<1;a=b}}f[c>>2]=i;f[i+24>>2]=a;f[i+12>>2]=i;f[i+8>>2]=i;break a}while(0);h=a+8|0;j=f[h>>2]|0;f[j+12>>2]=i;f[h>>2]=i;f[i+8>>2]=j;f[i+12>>2]=a;f[i+24>>2]=0}while(0);j=(f[5764]|0)+-1|0;f[5764]=j;if(j|0)return;a=23480;while(1){a=f[a>>2]|0;if(!a)break;else a=a+8|0}f[5764]=-1;return}function Pc(a,b){a=a|0;b=b|0;var c=0;if(a){c=S(b,a)|0;if((b|a)>>>0>65535)c=((c>>>0)/(a>>>0)|0|0)==(b|0)?c:-1}else c=0;a=Nc(c)|0;if(!a)return a|0;if(!(f[a+-4>>2]&3))return a|0;ad(a|0,0,c|0)|0;return a|0}function Qc(){return 23520}function Rc(a){a=+a;return +(+bd(+a))}function Sc(a){a=+a;return ~~+Rc(a)|0}function Tc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;c=a+c>>>0;return (Y(b+d+(c>>>0<a>>>0|0)>>>0|0),c|0)|0}function Uc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;d=b-d-(c>>>0>a>>>0|0)>>>0;return (Y(d|0),a-c>>>0|0)|0}function Vc(a){a=a|0;return (a?31-(V(a^a-1)|0)|0:32)|0}function Wc(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;l=a;j=b;k=j;h=c;n=d;i=n;if(!k){g=(e|0)!=0;if(!i){if(g){f[e>>2]=(l>>>0)%(h>>>0);f[e+4>>2]=0}n=0;e=(l>>>0)/(h>>>0)>>>0;return (Y(n|0),e)|0}else{if(!g){n=0;e=0;return (Y(n|0),e)|0}f[e>>2]=a|0;f[e+4>>2]=b&0;n=0;e=0;return (Y(n|0),e)|0}}g=(i|0)==0;do if(h){if(!g){g=(V(i|0)|0)-(V(k|0)|0)|0;if(g>>>0<=31){m=g+1|0;i=31-g|0;b=g-31>>31;h=m;a=l>>>(m>>>0)&b|k<<i;b=k>>>(m>>>0)&b;g=0;i=l<<i;break}if(!e){n=0;e=0;return (Y(n|0),e)|0}f[e>>2]=a|0;f[e+4>>2]=j|b&0;n=0;e=0;return (Y(n|0),e)|0}g=h-1|0;if(g&h|0){i=(V(h|0)|0)+33-(V(k|0)|0)|0;p=64-i|0;m=32-i|0;j=m>>31;o=i-32|0;b=o>>31;h=i;a=m-1>>31&k>>>(o>>>0)|(k<<m|l>>>(i>>>0))&b;b=b&k>>>(i>>>0);g=l<<p&j;i=(k<<p|l>>>(o>>>0))&j|l<<m&i-33>>31;break}if(e|0){f[e>>2]=g&l;f[e+4>>2]=0}if((h|0)==1){o=j|b&0;p=a|0|0;return (Y(o|0),p)|0}else{p=Vc(h|0)|0;o=k>>>(p>>>0)|0;p=k<<32-p|l>>>(p>>>0)|0;return (Y(o|0),p)|0}}else{if(g){if(e|0){f[e>>2]=(k>>>0)%(h>>>0);f[e+4>>2]=0}o=0;p=(k>>>0)/(h>>>0)>>>0;return (Y(o|0),p)|0}if(!l){if(e|0){f[e>>2]=0;f[e+4>>2]=(k>>>0)%(i>>>0)}o=0;p=(k>>>0)/(i>>>0)>>>0;return (Y(o|0),p)|0}g=i-1|0;if(!(g&i)){if(e|0){f[e>>2]=a|0;f[e+4>>2]=g&k|b&0}o=0;p=k>>>((Vc(i|0)|0)>>>0);return (Y(o|0),p)|0}g=(V(i|0)|0)-(V(k|0)|0)|0;if(g>>>0<=30){b=g+1|0;i=31-g|0;h=b;a=k<<i|l>>>(b>>>0);b=k>>>(b>>>0);g=0;i=l<<i;break}if(!e){o=0;p=0;return (Y(o|0),p)|0}f[e>>2]=a|0;f[e+4>>2]=j|b&0;o=0;p=0;return (Y(o|0),p)|0}while(0);if(!h){k=i;j=0;i=0}else{m=c|0|0;l=n|d&0;k=Tc(m|0,l|0,-1,-1)|0;c=Z()|0;j=i;i=0;do{d=j;j=g>>>31|j<<1;g=i|g<<1;d=a<<1|d>>>31|0;n=a>>>31|b<<1|0;Uc(k|0,c|0,d|0,n|0)|0;p=Z()|0;o=p>>31|((p|0)<0?-1:0)<<1;i=o&1;a=Uc(d|0,n|0,o&m|0,(((p|0)<0?-1:0)>>31|((p|0)<0?-1:0)<<1)&l|0)|0;b=Z()|0;h=h-1|0}while((h|0)!=0);k=j;j=0}h=0;if(e|0){f[e>>2]=a;f[e+4>>2]=b}o=(g|0)>>>31|(k|h)<<1|(h<<1|g>>>31)&0|j;p=(g<<1|0>>>31)&-2|i;return (Y(o|0),p)|0}function Xc(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,g=0;g=ea;ea=ea+16|0;e=g|0;Wc(a,b,c,d,e)|0;ea=g;return (Y(f[e+4>>2]|0),f[e>>2]|0)|0}function Yc(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){Y(b>>>c|0);return a>>>c|(b&(1<<c)-1)<<32-c}Y(0);return b>>>c-32|0}function Zc(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){Y(b<<c|(a&(1<<c)-1<<32-c)>>>32-c|0);return a<<c}Y(a<<c-32|0);return 0}function _c(a){a=+a;return a>=0.0?+E(a+.5):+R(a-.5)}function $c(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0;if((d|0)>=8192){ca(a|0,c|0,d|0)|0;return a|0}h=a|0;g=a+d|0;if((a&3)==(c&3)){while(a&3){if(!d)return h|0;b[a>>0]=b[c>>0]|0;a=a+1|0;c=c+1|0;d=d-1|0}d=g&-4|0;e=d-64|0;while((a|0)<=(e|0)){f[a>>2]=f[c>>2];f[a+4>>2]=f[c+4>>2];f[a+8>>2]=f[c+8>>2];f[a+12>>2]=f[c+12>>2];f[a+16>>2]=f[c+16>>2];f[a+20>>2]=f[c+20>>2];f[a+24>>2]=f[c+24>>2];f[a+28>>2]=f[c+28>>2];f[a+32>>2]=f[c+32>>2];f[a+36>>2]=f[c+36>>2];f[a+40>>2]=f[c+40>>2];f[a+44>>2]=f[c+44>>2];f[a+48>>2]=f[c+48>>2];f[a+52>>2]=f[c+52>>2];f[a+56>>2]=f[c+56>>2];f[a+60>>2]=f[c+60>>2];a=a+64|0;c=c+64|0}while((a|0)<(d|0)){f[a>>2]=f[c>>2];a=a+4|0;c=c+4|0}}else{d=g-4|0;while((a|0)<(d|0)){b[a>>0]=b[c>>0]|0;b[a+1>>0]=b[c+1>>0]|0;b[a+2>>0]=b[c+2>>0]|0;b[a+3>>0]=b[c+3>>0]|0;a=a+4|0;c=c+4|0}}while((a|0)<(g|0)){b[a>>0]=b[c>>0]|0;a=a+1|0;c=c+1|0}return h|0}function ad(a,c,d){a=a|0;c=c|0;d=d|0;var e=0,g=0,h=0,i=0;h=a+d|0;c=c&255;if((d|0)>=67){while(a&3){b[a>>0]=c;a=a+1|0}e=h&-4|0;g=e-64|0;i=c|c<<8|c<<16|c<<24;while((a|0)<=(g|0)){f[a>>2]=i;f[a+4>>2]=i;f[a+8>>2]=i;f[a+12>>2]=i;f[a+16>>2]=i;f[a+20>>2]=i;f[a+24>>2]=i;f[a+28>>2]=i;f[a+32>>2]=i;f[a+36>>2]=i;f[a+40>>2]=i;f[a+44>>2]=i;f[a+48>>2]=i;f[a+52>>2]=i;f[a+56>>2]=i;f[a+60>>2]=i;a=a+64|0}while((a|0)<(e|0)){f[a>>2]=i;a=a+4|0}}while((a|0)<(h|0)){b[a>>0]=c;a=a+1|0}return h-d|0}function bd(a){a=+a;return a>=0.0?+E(a+.5):+R(a-.5)}function cd(a){a=a|0;var b=0,c=0;c=f[r>>2]|0;b=c+a|0;if((a|0)>0&(b|0)<(c|0)|(b|0)<0){_()|0;aa(12);return -1}if((b|0)>(ba()|0)){if(!(da(b|0)|0)){aa(12);return -1}}else f[r>>2]=b;return c|0}

// EMSCRIPTEN_END_FUNCS
return{___uremdi3:Xc,_bitshift64Lshr:Yc,_bitshift64Shl:Zc,_calloc:Pc,_compact:Hb,_destroyLinkedPolygon:fc,_edgeLengthKm:yb,_edgeLengthM:zb,_emscripten_replace_memory:ha,_experimentalH3ToLocalIj:kc,_experimentalLocalIjToH3:lc,_free:Oc,_geoToH3:Sb,_getDestinationH3IndexFromUnidirectionalEdge:_b,_getH3IndexesFromUnidirectionalEdge:ac,_getH3UnidirectionalEdge:Yb,_getH3UnidirectionalEdgeBoundary:cc,_getH3UnidirectionalEdgesFromHexagon:bc,_getOriginH3IndexFromUnidirectionalEdge:Zb,_getRes0Indexes:Ga,_h3Distance:mc,_h3GetBaseCell:Bb,_h3IndexesAreNeighbors:Xb,_h3IsPentagon:Gb,_h3IsResClassIII:Kb,_h3IsValid:Cb,_h3Line:oc,_h3LineSize:nc,_h3SetToLinkedGeo:xa,_h3ToChildren:Fb,_h3ToGeo:Vb,_h3ToGeoBoundary:Wb,_h3ToParent:Db,_h3UnidirectionalEdgeIsValid:$b,_hexAreaKm2:wb,_hexAreaM2:xb,_hexRing:ta,_i64Subtract:Uc,_kRing:oa,_kRingDistances:pa,_llvm_round_f64:_c,_malloc:Nc,_maxH3ToChildrenSize:Eb,_maxKringSize:na,_maxPolyfillSize:ua,_maxUncompactSize:Jb,_memcpy:$c,_memset:ad,_numHexagons:Ab,_polyfill:va,_res0IndexCount:Fa,_round:bd,_sbrk:cd,_sizeOfCoordIJ:Ac,_sizeOfGeoBoundary:wc,_sizeOfGeoCoord:vc,_sizeOfGeoPolygon:yc,_sizeOfGeofence:xc,_sizeOfH3Index:uc,_sizeOfLinkedGeoPolygon:zc,_uncompact:Ib,establishStackSpace:la,setThrew:ma,stackAlloc:ia,stackRestore:ka,stackSave:ja}})


// EMSCRIPTEN_END_ASM
(asmGlobalArg,Module.asmLibraryArg,buffer);var ___uremdi3=Module["___uremdi3"]=asm["___uremdi3"];var _bitshift64Lshr=Module["_bitshift64Lshr"]=asm["_bitshift64Lshr"];var _bitshift64Shl=Module["_bitshift64Shl"]=asm["_bitshift64Shl"];var _calloc=Module["_calloc"]=asm["_calloc"];var _compact=Module["_compact"]=asm["_compact"];var _destroyLinkedPolygon=Module["_destroyLinkedPolygon"]=asm["_destroyLinkedPolygon"];var _edgeLengthKm=Module["_edgeLengthKm"]=asm["_edgeLengthKm"];var _edgeLengthM=Module["_edgeLengthM"]=asm["_edgeLengthM"];var _emscripten_replace_memory=Module["_emscripten_replace_memory"]=asm["_emscripten_replace_memory"];var _experimentalH3ToLocalIj=Module["_experimentalH3ToLocalIj"]=asm["_experimentalH3ToLocalIj"];var _experimentalLocalIjToH3=Module["_experimentalLocalIjToH3"]=asm["_experimentalLocalIjToH3"];var _free=Module["_free"]=asm["_free"];var _geoToH3=Module["_geoToH3"]=asm["_geoToH3"];var _getDestinationH3IndexFromUnidirectionalEdge=Module["_getDestinationH3IndexFromUnidirectionalEdge"]=asm["_getDestinationH3IndexFromUnidirectionalEdge"];var _getH3IndexesFromUnidirectionalEdge=Module["_getH3IndexesFromUnidirectionalEdge"]=asm["_getH3IndexesFromUnidirectionalEdge"];var _getH3UnidirectionalEdge=Module["_getH3UnidirectionalEdge"]=asm["_getH3UnidirectionalEdge"];var _getH3UnidirectionalEdgeBoundary=Module["_getH3UnidirectionalEdgeBoundary"]=asm["_getH3UnidirectionalEdgeBoundary"];var _getH3UnidirectionalEdgesFromHexagon=Module["_getH3UnidirectionalEdgesFromHexagon"]=asm["_getH3UnidirectionalEdgesFromHexagon"];var _getOriginH3IndexFromUnidirectionalEdge=Module["_getOriginH3IndexFromUnidirectionalEdge"]=asm["_getOriginH3IndexFromUnidirectionalEdge"];var _getRes0Indexes=Module["_getRes0Indexes"]=asm["_getRes0Indexes"];var _h3Distance=Module["_h3Distance"]=asm["_h3Distance"];var _h3GetBaseCell=Module["_h3GetBaseCell"]=asm["_h3GetBaseCell"];var _h3IndexesAreNeighbors=Module["_h3IndexesAreNeighbors"]=asm["_h3IndexesAreNeighbors"];var _h3IsPentagon=Module["_h3IsPentagon"]=asm["_h3IsPentagon"];var _h3IsResClassIII=Module["_h3IsResClassIII"]=asm["_h3IsResClassIII"];var _h3IsValid=Module["_h3IsValid"]=asm["_h3IsValid"];var _h3Line=Module["_h3Line"]=asm["_h3Line"];var _h3LineSize=Module["_h3LineSize"]=asm["_h3LineSize"];var _h3SetToLinkedGeo=Module["_h3SetToLinkedGeo"]=asm["_h3SetToLinkedGeo"];var _h3ToChildren=Module["_h3ToChildren"]=asm["_h3ToChildren"];var _h3ToGeo=Module["_h3ToGeo"]=asm["_h3ToGeo"];var _h3ToGeoBoundary=Module["_h3ToGeoBoundary"]=asm["_h3ToGeoBoundary"];var _h3ToParent=Module["_h3ToParent"]=asm["_h3ToParent"];var _h3UnidirectionalEdgeIsValid=Module["_h3UnidirectionalEdgeIsValid"]=asm["_h3UnidirectionalEdgeIsValid"];var _hexAreaKm2=Module["_hexAreaKm2"]=asm["_hexAreaKm2"];var _hexAreaM2=Module["_hexAreaM2"]=asm["_hexAreaM2"];var _hexRing=Module["_hexRing"]=asm["_hexRing"];var _i64Subtract=Module["_i64Subtract"]=asm["_i64Subtract"];var _kRing=Module["_kRing"]=asm["_kRing"];var _kRingDistances=Module["_kRingDistances"]=asm["_kRingDistances"];var _llvm_round_f64=Module["_llvm_round_f64"]=asm["_llvm_round_f64"];var _malloc=Module["_malloc"]=asm["_malloc"];var _maxH3ToChildrenSize=Module["_maxH3ToChildrenSize"]=asm["_maxH3ToChildrenSize"];var _maxKringSize=Module["_maxKringSize"]=asm["_maxKringSize"];var _maxPolyfillSize=Module["_maxPolyfillSize"]=asm["_maxPolyfillSize"];var _maxUncompactSize=Module["_maxUncompactSize"]=asm["_maxUncompactSize"];var _memcpy=Module["_memcpy"]=asm["_memcpy"];var _memset=Module["_memset"]=asm["_memset"];var _numHexagons=Module["_numHexagons"]=asm["_numHexagons"];var _polyfill=Module["_polyfill"]=asm["_polyfill"];var _res0IndexCount=Module["_res0IndexCount"]=asm["_res0IndexCount"];var _round=Module["_round"]=asm["_round"];var _sbrk=Module["_sbrk"]=asm["_sbrk"];var _sizeOfCoordIJ=Module["_sizeOfCoordIJ"]=asm["_sizeOfCoordIJ"];var _sizeOfGeoBoundary=Module["_sizeOfGeoBoundary"]=asm["_sizeOfGeoBoundary"];var _sizeOfGeoCoord=Module["_sizeOfGeoCoord"]=asm["_sizeOfGeoCoord"];var _sizeOfGeoPolygon=Module["_sizeOfGeoPolygon"]=asm["_sizeOfGeoPolygon"];var _sizeOfGeofence=Module["_sizeOfGeofence"]=asm["_sizeOfGeofence"];var _sizeOfH3Index=Module["_sizeOfH3Index"]=asm["_sizeOfH3Index"];var _sizeOfLinkedGeoPolygon=Module["_sizeOfLinkedGeoPolygon"]=asm["_sizeOfLinkedGeoPolygon"];var _uncompact=Module["_uncompact"]=asm["_uncompact"];var establishStackSpace=Module["establishStackSpace"]=asm["establishStackSpace"];var setThrew=Module["setThrew"]=asm["setThrew"];var stackAlloc=Module["stackAlloc"]=asm["stackAlloc"];var stackRestore=Module["stackRestore"]=asm["stackRestore"];var stackSave=Module["stackSave"]=asm["stackSave"];Module["asm"]=asm;Module["cwrap"]=cwrap;Module["setValue"]=setValue;Module["getValue"]=getValue;Module["getTempRet0"]=getTempRet0;if(memoryInitializer){if(!isDataURI(memoryInitializer)){memoryInitializer=locateFile(memoryInitializer)}if(ENVIRONMENT_IS_NODE||ENVIRONMENT_IS_SHELL){var data=Module["readBinary"](memoryInitializer);HEAPU8.set(data,GLOBAL_BASE)}else{addRunDependency("memory initializer");var applyMemoryInitializer=(function(data){if(data.byteLength)data=new Uint8Array(data);HEAPU8.set(data,GLOBAL_BASE);if(Module["memoryInitializerRequest"])delete Module["memoryInitializerRequest"].response;removeRunDependency("memory initializer")});var doBrowserLoad=(function(){Module["readAsync"](memoryInitializer,applyMemoryInitializer,(function(){throw"could not load memory initializer "+memoryInitializer}))});var memoryInitializerBytes=tryParseAsDataURI(memoryInitializer);if(memoryInitializerBytes){applyMemoryInitializer(memoryInitializerBytes.buffer)}else if(Module["memoryInitializerRequest"]){var useRequest=(function(){var request=Module["memoryInitializerRequest"];var response=request.response;if(request.status!==200&&request.status!==0){var data=tryParseAsDataURI(Module["memoryInitializerRequestURL"]);if(data){response=data.buffer}else{console.warn("a problem seems to have happened with Module.memoryInitializerRequest, status: "+request.status+", retrying "+memoryInitializer);doBrowserLoad();return}}applyMemoryInitializer(response)});if(Module["memoryInitializerRequest"].response){setTimeout(useRequest,0)}else{Module["memoryInitializerRequest"].addEventListener("load",useRequest)}}else{doBrowserLoad()}}}Module["then"]=(function(func){if(Module["calledRun"]){func(Module)}else{var old=Module["onRuntimeInitialized"];Module["onRuntimeInitialized"]=(function(){if(old)old();func(Module)})}return Module});function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};function run(args){args=args||Module["arguments"];if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout((function(){setTimeout((function(){Module["setStatus"]("")}),1);doRun()}),1)}else{doRun()}}Module["run"]=run;function abort(what){if(Module["onAbort"]){Module["onAbort"](what)}if(what!==undefined){out(what);err(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;throw"abort("+what+"). Build with -s ASSERTIONS=1 for more info."}Module["abort"]=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}Module["noExitRuntime"]=true;run()






  return libh3;
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
      module.exports = libh3;
    else if (typeof define === 'function' && define['amd'])
      define([], function() { return libh3; });
    else if (typeof exports === 'object')
      exports["libh3"] = libh3;
    var h3 = libh3();
module.exports = h3;

}).call(this,require('_process'),require("buffer").Buffer,"/node_modules/h3-js/dist/out")
},{"_process":6,"buffer":3,"fs":1,"path":5}],11:[function(require,module,exports){
/*
 * Copyright 2018 Uber Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = require('./dist/lib/h3core');

},{"./dist/lib/h3core":9}]},{},[7]);
