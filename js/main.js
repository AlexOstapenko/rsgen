const RTSG_PARAMS = [
	{ 
		name: 'metryx', 
		options:  ['3 - 2', '3 - 3', '3 - 4', '4 - 2', '4 - 3',
		'4 - 4', '5 - 2', '5 - 3', '5 - 4', '6 - 2', '7 - 2']
	}, 
	{
		name: 'mode',
		options: ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian']
	},
	{
		name: 'shape',
		options: ['Sequence', 'Period', 'Question/Answer' ]
	},
	{
		name : 'anchor',
		type: 'slave',
		masterName: 'mode',
		cases: [
			{
				values: ['Dorian', 'Phrygian', 'Aeolian'],
				options : ['mi3', 'p5']
			},
			{
				values : ['Ionian', 'Lydian', 'Mixolydian'],
				options : ['ma3', 'p5']
			}
		]
	},
	{
		name: 'tempo',
		type: 'range',
		min: 50,
		max: 150
	}
]

const RandomStructureGenerator = {

	// contains all random value objects
	values: [],


	randomInt( min, max ) {
		return Math.floor( min + Math.random() * (max + 1 - min) );
	},

	// Random value from a range
	RandomRangeValue: class {
		constructor(name, min, max) {
			this.name = name;
			this.min = min;
			this.max = max;
		}

		randomValue() {
			return RandomStructureGenerator.randomInt( this.min, this.max );
		}
	},

	// Default: simple array of alternative values
	RandomAlternativesValue: class {
		constructor( name, arr ) {
			this.name = name;
			this.alternatives = arr;
			this.randVal = new RandomStructureGenerator.RandomRangeValue('', 0, this.alternatives.length-1);
		}

		randomValue() {
			return this.alternatives[ this.randVal.randomValue() ];
		}
	},

	// Depends on some other parameter's value
	RandomAlternativesValueSlave : class {
		constructor( masterName, name, cases ) {
			this.masterName = masterName;
			this.name = name;
			this.cases = cases;
		}

		randomValue() {
			const masterValue = RandomStructureGenerator.DOMHelper.getDocElementValue( this.masterName );
			
			let result = null;
			for( let i=0; i< this.cases.length; i++) {
				let theCase = this.cases[i];
				if ( theCase.values.includes( masterValue ) )
				{
					let randIdx = RandomStructureGenerator.randomInt( 0, theCase.options.length-1 );
					result = theCase.options[randIdx];
					break;
				}
			};

			return result ? result : "";
		}
	},

	DOMHelper : class {
		static getDocElement( valueName ) {
			return document.querySelector( `#${valueName}-value` );
		}

		static getDocElementValue( valueName ) {
			return this.getDocElement( valueName ).innerHTML;
		}		

		static setDocElementValue( valueName, value ) {
			this.getDocElement( valueName ).innerHTML = value;
		}
	},

	init() {
		// Create random value objects for all types of parameters
		RTSG_PARAMS.forEach( param => {
			let valueObj = null;

			switch( param.type ) {
				case 'range' :
					valueObj = new RandomStructureGenerator.RandomRangeValue( param.name, param.min, param.max );
					break;
				case 'slave' : 
					valueObj = new RandomStructureGenerator.RandomAlternativesValueSlave( 
							param.masterName, param.name, param.cases );
					break;
				default:
					valueObj = new RandomStructureGenerator.RandomAlternativesValue( param.name, param.options )
			}

			if (valueObj)
	        	this.values.push( valueObj );
		});
	},

	// The order of values is important: some values are slaves of anothers
	generateRandomValues() {
		this.values.forEach( val => {
			RandomStructureGenerator.DOMHelper.setDocElementValue( val.name, val.randomValue() );
		});
	}
}

RandomStructureGenerator.init();
RandomStructureGenerator.generateRandomValues();

document.querySelector("#buttRandomize").addEventListener( "click", function() {
	RandomStructureGenerator.generateRandomValues();
});
