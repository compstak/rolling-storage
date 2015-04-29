/* global describe, expect, it, rollingStorage, beforeEach */
describe('Setting, getting, and clearing', function () {
	
	var inst;
	beforeEach(function () {
		inst = rollingStorage({
			namespace: 'my-items',
			ttl: 1000 * 60 * 60, // 1 hour
			maxSize: 1024 * 1024 * 1.5, // 1.5 MB
			storage: sessionStorage
		});

		inst.flush();
	});

	it('Should store a string', function () {
		inst.set('test-string', '1234567890987654321');
		expect(inst.get('test-string')).to.be('1234567890987654321');
	});

	it('Should clear said string in the flush process', function () {
		expect(inst.get('test-string')).to.be(undefined);
	});

	it('Should store a number', function () {
		inst.set('test-number', 1234);
		expect(inst.get('test-number')).to.be(1234);
	});

	it('Should store a bool', function () {
		inst.set('test-bool', true);
		expect(inst.get('test-bool')).to.be(true);
	});

	it('Should store an array', function () {
		inst.set('test-array', ['pig', 'dog', 'donut']);
		expect(inst.get('test-array')).to.eql(['pig', 'dog', 'donut']);
	});

	it('Should store an object', function () {
		inst.set('test-object', {'pig': 'dog', 'donut': 'bagel'});
		expect(inst.get('test-object')).to.eql({'pig': 'dog', 'donut': 'bagel'});
	});

	it('Should remove values when requested', function () {
		inst.set('test-string', '1234567890987654321');
		inst.remove('test-string');
		expect(inst.get('test-string')).to.be(undefined);
	});

	it('Should respond to has correctly', function () {
		expect(inst.has('test-string')).to.be(false);
		
		inst.set('test-string', '1234567890987654321');
		expect(inst.has('test-string')).to.be(true);
		
		inst.remove('test-string');
		expect(inst.has('test-string')).to.be(false);
	});

	it('Should flush many values correctly', function () {
		
		inst.set('test-string1', '1234567890987654321');
		inst.set('test-string2', '1234567890987654321');
		inst.set('test-string3', '1234567890987654321');
		inst.set('test-string4', '1234567890987654321');
		inst.set('test-string5', '1234567890987654321');
		
		inst.flush();
		
		expect(inst.has('test-string1')).to.be(false);
		expect(inst.has('test-string2')).to.be(false);
		expect(inst.has('test-string3')).to.be(false);
		expect(inst.has('test-string4')).to.be(false);
		expect(inst.has('test-string5')).to.be(false);
	});

	it('should not be affected by other instances', function () {

		var inst2 = rollingStorage({
			namespace: 'my-items',
			ttl: 1000 * 60 * 60, // 1 hour
			maxSize: 1024 * 1024 * 1.5, // 1.5 MB
			storage: sessionStorage
		});

		inst2.flush();

		
		inst2.set('test-string1', '1234567890987654321');
				
		expect(inst.has('test-string1')).to.be(false);
		expect(inst2.has('test-string1')).to.be(true);
	});


});
