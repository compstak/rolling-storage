(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else if (typeof module !== "undefined" && module.exports) {
		// CommonJS/Node module
		module.exports = factory();
	} else {
		// Browser globals
		root.rollingStorage = factory();
	}
}(this, function () {

	var existingCaches = {};

	var rollingStorage = function (options) {

		var storage = options.storage;
		var namespace = options.namespace;
		var ttl = options.ttl;
		var maxSize = options.maxSize;

		if (existingCaches[namespace]) {
			return existingCaches[namespace];
		}

		if (!storage) {
			throw new Error('Attemted to create a rollingStorage instance without a storage strategy! Usually this is localStorage or sessionStorage.');
		}

		if (!namespace) {
			throw new Error('Attemted to create a rollingStorage instance without a namespace!');
		}

		if (!ttl) {
			throw new Error('Attemted to create a rollingStorage instance without a ttl! This is the number of milliseconds it will keep content.');
		}

		if (!maxSize) {
			throw new Error('Attemted to create a rollingStorage instance without a maxSize! This is the largest it will allow the cache to grow.');
		}

		function makeKey (key) {
			return 'rollingStorage-'+namespace+'-'+key;
		}

		var inventory = JSON.parse(storage.getItem('rollingStorage-inventory-'+namespace) || '[]');
		var size = 0;
		var timeouts = {};

		inventory.forEach(function (item) {
			size += item.size;
		});

		var saveInventoryTimeout = null;
		function saveInventory () {
			if (!saveInventoryTimeout) {
				saveInventoryTimeout = setTimeout(function () {
					saveInventoryTimeout = null;
					storage.setItem('rollingStorage-inventory-'+namespace, JSON.stringify(inventory));
				}, 4);
			}
		}

		function remove (key) {
			var i = 0;
			while (inventory[i] && inventory[i].key !== key) {
				i += 1;
			}

			var item = inventory[i];

			if (item) {
				storage.removeItem(makeKey(item.key));
				size -= item.size;
				clearTimeout(timeouts[item.key]);
				delete timeouts[item.key];
				inventory.splice(i, 1);
				saveInventory();
			}
		}

		// determine if anything is expired and remove it.
		var now = Date.now();
		inventory.slice().forEach(function (item) {
			var remainingTtl = item.expiration - now;
			if (remainingTtl < 0) {
				remove(item.key);
			} else {
				timeouts[item.key] = setTimeout(function () {
					remove(item.key);
				}, remainingTtl);
			}
		});

		function has (key) {
			for (var i = 0; i < inventory.length; i += 1) {
				if (inventory[i].key === key) {
					return true;
				}
			}
			return false;
		}

		function get (key) {
			if (has(key)) {
				return JSON.parse(storage.getItem(makeKey(key)));
			} else {
				return undefined;
			}
		}

		function set (key, value) {
			remove(key);

			var jsonString = JSON.stringify(value);
			var indexEntry = {
				key: key,
				expiration: Date.now() + ttl,
				size: jsonString.length
			};

			size += indexEntry.size;

			while (size > maxSize && inventory.length) {
				remove(inventory[0].key);
			}

			clearTimeout(timeouts[key]); // in case we're saving over an old value.

			timeouts[key] = setTimeout(function () {
				remove(key);
			}, ttl);

			inventory.push(indexEntry);

			var doneTrying = false;
			while (!doneTrying) {
				try {
					storage.setItem(makeKey(key), jsonString);
					saveInventory();
					doneTrying = true;
				} catch (e) {
					if (inventory.length) {
						remove(inventory[0].key);
					} else {
						// this will happen when the remaining storage is smaller than the item.
						doneTrying = true;
					}
				}
			}
		}

		function flush () {
			while (inventory.length) {
				remove(inventory[0].key);
			}
		}

		var exports = {
			has: has,
			get: get,
			set: set,
			remove: remove,
			flush: flush
		};

		existingCaches[namespace] = exports;

		return exports;
	};

	return rollingStorage;
}));
