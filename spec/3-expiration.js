/* global describe, expect, it, rollingStorage, beforeEach, afterEach, jasmine */
describe('Setting, getting, and clearing', function () {
	
	function createIt (ttl, maxSize) {
		var inst = rollingStorage({
			namespace: 'my-items',
			ttl: ttl || 1000 * 60 * 60, // 1 hour
			maxSize: maxSize || 1024 * 1024 * 1.5, // 1.5 MB
			storage: sessionStorage
		});

		inst.flush();
		return inst;
	}

	beforeEach(function() {
		jasmine.clock().install();
	});

	afterEach(function() {
		jasmine.clock().uninstall();
	});

	it('Should expire after the ttl', function () {
		var inst = createIt(10);

		inst.set('timer!', 'poo');
		expect(inst.has('timer!')).toBe(true);

		jasmine.clock().tick(11);
		expect(inst.has('timer!')).toBe(false);

		inst.flush();

	});

	it('Should remove when a large item comes in', function () {
		var inst = createIt(undefined, 10);

		inst.set('first', 'poo');
		expect(inst.has('first')).toBe(true);

		inst.set('bigger-poo', 'somuchbig');
		expect(inst.has('first')).toBe(false);
		expect(inst.has('bigger-poo')).toBe(true);

		inst.set('smaller-poo', '1');
		expect(inst.has('bigger-poo')).toBe(false);
		expect(inst.has('smaller-poo')).toBe(true);

		inst.flush();
	});

});
