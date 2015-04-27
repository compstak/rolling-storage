# Rolling Storage

Rolling storage provides an API to localStorage and sessionStorage (or anything that implements the storage interface) that provides expiration and a maximum size.

## Basic Usage

```javascript
var rollingStorage = require('rolling-storage');

var storedItems = rollingStorage({
	namespace: 'my-items',
	ttl: 1000 * 60 * 60, // 1 hour
	maxSize: 1024 * 1024 * 1.5, // 1.5 MB
	storage: localStorage
})

// set
storedItems.set('thing1', 'hello!');

// access
storedItems.has('thing1'); // true
storedItems.get('thing1'); // 'hello!'

// remove
storedItems.remove('thing1');

// now it's gone
storedItems.has('thing1'); // false
storedItems.get('thing1'); // undefined

```

## Creating an Instance

Each instance of rollingStorage has a namspace, a ttl, a maximum size, and must be provided with a storage strategy.

* `namespace` - This keeps instances of rollingStorage separate. Can be any string.
* `ttl` - The expiration time of values in milliseconds.
* `maxSize` - The max size of this namespace. Old elements will be removed when this limit is exceeded.
* `storage` - Probably localStorage or sessionStorage, but can be anything that implements the Storage API.

## Using an Instace

Instance methods:

* `instance.set(key, value)` - sets a value. Value can be any type that can be run through JSON.stringify.
* `instance.get(key)` - gets a value from storage or undefined if the key doesn't exist.
* `instance.has(key)` - returns true if this key exists, false otherwise.
* `instance.remove(key)` - removes a key from storage.
* `instance.flush()` - removes all values from this instance.

## Running The Tests

The tests were written with Jasmine and Testem.

1. `npm install -g testem`
2. `testem`
3. Open http://localhost:7357
