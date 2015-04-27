/* global describe, expect, it, rollingStorage */
describe('Instantiation', function () {
	it('should be a function', function () {
		expect(typeof rollingStorage).toBe('function');
	});

	it('should error if no options are provided', function () {
		expect(rollingStorage).toThrow();
	});

	it('should error if only invalid options are provided', function () {
		expect(function () {
			return rollingStorage({'fart': 'fart'});
		}).toThrow();
	});

	it('should error if namespace is left off', function () {
		expect(function () {
			return rollingStorage({
				ttl: 1000 * 60 * 60, // 1 hour
				maxSize: 1024 * 1024 * 1.5, // 1.5 MB
				storage: localStorage
			});
		}).toThrow();
	});

	it('should error if ttl is left off', function () {
		expect(function () {
			return rollingStorage({
				namespace: 'my-items',
				maxSize: 1024 * 1024 * 1.5, // 1.5 MB
				storage: localStorage
			});
		}).toThrow();
	});

	it('should error if maxSize is left off', function () {
		expect(function () {
			return rollingStorage({
				namespace: 'my-items',
				ttl: 1000 * 60 * 60, // 1 hour
				storage: localStorage
			});
		}).toThrow();
	});

	it('should error if storage strategy is left off', function () {
		expect(function () {
			return rollingStorage({
				namespace: 'my-items',
				ttl: 1000 * 60 * 60, // 1 hour
				maxSize: 1024 * 1024 * 1.5, // 1.5 MB
			});
		}).toThrow();
	});

	it('should give you an object with the appriate interface', function () {
		var inst = rollingStorage({
			namespace: 'my-items',
			ttl: 1000 * 60 * 60, // 1 hour
			maxSize: 1024 * 1024 * 1.5, // 1.5 MB
			storage: localStorage
		});

		expect(typeof inst.get).toBe('function');
		expect(typeof inst.set).toBe('function');
		expect(typeof inst.has).toBe('function');
		expect(typeof inst.remove).toBe('function');
		expect(typeof inst.flush).toBe('function');

	});
});
