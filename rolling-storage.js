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

	var rollingStorage = function (storage, namespace, ttl, maxSize) {

		function makeKey (key) {
			return 'smartStorage-'+namespace+'-'+key;
		}

		var inventory = JSON.parse(storage.getItem('smartStorage-index-'+namespace) || '[]');
		var size = 0;
		var timeouts = {};

		inventory.forEach(function (item) {
			size += item.size;
		});

		// determine if anything is expired and remove it.
		var now = Date.now();
		inventory.slice().forEach(function (item) {
			var ttl = item.expiration - now;
			if (ttl < 0) {
				remove(item.key);
			} else {
				timeouts[item.key] = setTimeout(remove.bind(null, item.key), ttl);
			}
		});

		function saveInventory () {
			storage.setItem('smartStorage-index-'+namespace, JSON.stringify(inventory));
		}

		function get (key) {
			if (has(key)) {
				return JSON.parse(storage.getItem(makeKey(key)));
			} else {
				return undefined;
			}
		}

		function has (key) {
			return !!inventory[key];
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

			timeouts[key] = setTimeout(remove.bind(null, key), ttl);

			inventory.push(indexEntry);

			var doneAdding = false;
			while (!doneAdding) {
				try {
					storage.setItem(makeKey(key), jsonString);
					saveInventory();
					doneAdding = true;
				} catch (e) {
					remove(inventory[0].key);
				}
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

		return exports;
	};

	return rollingStorage;
}));
