import { WordsearchSolver } from '../wordSearchSolver';

var assert = require('assert');
var chai = require('chai');
var fs = require('fs');
var expect = chai.expect;
var awsTextractResponse;

before(function () {
	// Fetch the AWS mock textract response
	awsTextractResponse = fs.readFileSync(process.cwd() + '/tests/mock-textract-response.json', 'utf8');
});

describe('WordsearchSolver', function () {
	describe('#generateBoard()', function () {
		it('should parse the board', function () {
			// The blocks returned by AWS Textract (i.e. LINE/WORD)
			let blocks = JSON.parse(awsTextractResponse).Blocks;
			const solver = new WordsearchSolver();
			const board = solver.generateBoard(blocks);

			// Should create a board comprised of 15 rows
			assert.equal(board.length, 15);
		});
	});
	describe('#findWordsInRows()', function () {
		it('should find various words on various rows', function () {
			let wordsToSearch = [
				'ALDER', 'APPLE', 'ASH', 'ASPEN',
				'BIRCH', 'BUCKTHORN',
				'CEDAR', 'CHERRY', 'CHESTNUT', 'CHINKAPIN', 'COTTONWOOD', 'CYPRESS',
				'DOGWOOD',
				'ELM',
				'FIR',
				'HAWTHORN', 'HAZEL',
				'LARCH',
				'MAPLE',
				'OAK',
				'PINE', 'POPLAR',
				'REDWOOD',
				'SEQUOIA', 'SPRUCE', 'SWEETGUM', 'SYCAMORE',
				'WALNUT', 'WILLOW',
				'YEW'
			];

			// The blocks returned by AWS Textract (i.e. LINE/WORD)
			let blocks = JSON.parse(awsTextractResponse).Blocks;
			const solver = new WordsearchSolver();
			const board = solver.generateBoard(blocks);
			const foundWords = solver.findWordsInRows(board, wordsToSearch);

			// Should find 8 words
			assert.equal(Object.keys(foundWords).length, 8);
			// Should have the correct row/start and end indexes
			expect(foundWords).to.deep.equal({
				CHESTNUT: { rowIndex: 4, startIndex: 4, endIndex: 11 },
				COTTONWOOD: { rowIndex: 6, startIndex: 5, endIndex: 14 },
				ALDER: { rowIndex: 9, startIndex: 10, endIndex: 14 },
				BIRCH: { rowIndex: 12, startIndex: 9, endIndex: 13 },
				HAZEL: { rowIndex: 13, startIndex: 1, endIndex: 5 },
				FIR: { rowIndex: 5, startIndex: 9, endIndex: 11 },
				REDWOOD: { rowIndex: 5, startIndex: 0, endIndex: 6 },
				MAPLE: { rowIndex: 13, startIndex: 4, endIndex: 8 }
			});
		})
	});
});
