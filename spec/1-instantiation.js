/* global describe, expect, it, rollingStorage */
describe('Instantiation', function () {
	
	it('should be a function', function () {
		expect(rollingStorage).to.be.a('function');
	});

	it('should error if no options are provided', function () {
		expect(rollingStorage).to.throwError();
	});

	it('should error if only invalid options are provided', function () {
		expect(function () {
			return rollingStorage({'fart': 'fart'});
		}).to.throwError();
	});

	it('should error if namespace is left off', function () {
		expect(function () {
			return rollingStorage({
				ttl: 1000 * 60 * 60, // 1 hour
				maxSize: 1024 * 1024 * 1.5, // 1.5 MB
				storage: localStorage
			});
		}).to.throwError();
	});

	it('should error if ttl is left off', function () {
		expect(function () {
			return rollingStorage({
				namespace: 'my-items',
				maxSize: 1024 * 1024 * 1.5, // 1.5 MB
				storage: localStorage
			});
		}).to.throwError();
	});

	it('should error if maxSize is left off', function () {
		expect(function () {
			return rollingStorage({
				namespace: 'my-items',
				ttl: 1000 * 60 * 60, // 1 hour
				storage: localStorage
			});
		}).to.throwError();
	});

	it('should error if storage strategy is left off', function () {
		expect(function () {
			return rollingStorage({
				namespace: 'my-items',
				ttl: 1000 * 60 * 60, // 1 hour
				maxSize: 1024 * 1024 * 1.5, // 1.5 MB
			});
		}).to.throwError();
	});

	it('should give you an object with the appriate interface', function () {
		var inst = rollingStorage({
			namespace: 'my-items',
			ttl: 1000 * 60 * 60, // 1 hour
			maxSize: 1024 * 1024 * 1.5, // 1.5 MB
			storage: localStorage
		});

		expect(inst.get).to.be.a('function');
		expect(inst.set).to.be.a('function');
		expect(inst.has).to.be.a('function');
		expect(inst.remove).to.be.a('function');
		expect(inst.flush).to.be.a('function');

	});
});
