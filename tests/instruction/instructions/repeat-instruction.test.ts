import { RepeatInstruction } from '../../../src/instruction/instructions/repeat-instruction';
import { MergeableInstruction } from '../../../src/instruction/instructions/mergeable-instruction';
import { Tab } from '../../../src/tab/tab';
import { Instruction } from '../../../src/instruction/instructions/instruction';
import {
  FailedInstructionWriteResult,
  InstructionWriteResult,
  SuccessInstructionWriteResult,
} from '../../../src/instruction/instruction-write-result';

class SuccessWriteTestInstruction extends Instruction {
  protected internalWriteOnTab(): InstructionWriteResult {
    return new SuccessInstructionWriteResult();
  }
}

class FailedWriteTestInstruction extends Instruction {
  constructor(public failureReasonIdentifier: string) {
    super();
  }

  protected internalWriteOnTab(): InstructionWriteResult {
    return new FailedInstructionWriteResult({
      failureReasonIdentifier: this.failureReasonIdentifier,
    });
  }
}

describe(`[${RepeatInstruction.name}]`, () => {
  it('should not be a mergeable instruction', () => {
    const instruction = new RepeatInstruction([], 2);

    expect(instruction).not.toBeInstanceOf(MergeableInstruction);
  });

  describe('[writeOnTab]', () => {
    it('should repeatedly write the instructions to repeat on write, returning a success write result', () => {
      const repetitions = 3;
      const instructionsToRepeat = [
        new SuccessWriteTestInstruction(),
        new SuccessWriteTestInstruction(),
      ];
      const instruction = new RepeatInstruction(instructionsToRepeat, repetitions);
      const tab = new Tab();

      instructionsToRepeat.forEach(
        (instruction) => (instruction.writeOnTab = jest.fn(instruction.writeOnTab))
      );
      const writeResult = instruction.writeOnTab(tab);

      expect(writeResult.success).toBe(true);
      instructionsToRepeat.forEach((instruction) => {
        expect(instruction.writeOnTab).toHaveBeenCalledTimes(repetitions);

        for (let i = 0; i < repetitions; i++) {
          expect(instruction.writeOnTab).toHaveBeenNthCalledWith(i + 1, tab);
        }
      });
    });

    it('should return a failed write result when the instruction to repeat fails to be written on tab', () => {
      const writeFailReason = 'TEST_REASON';
      const instructionToRepeat = new FailedWriteTestInstruction(writeFailReason);
      const instruction = new RepeatInstruction([instructionToRepeat], 1);
      const tab = new Tab();

      instructionToRepeat.writeOnTab = jest.fn(instructionToRepeat.writeOnTab);
      const writeResult = instruction.writeOnTab(tab);

      expect(instructionToRepeat.writeOnTab).toHaveBeenCalled();
      expect(writeResult.success).toBe(false);
      expect(writeResult.failureReasonIdentifier).toBe(writeFailReason);
    });
  });
});
