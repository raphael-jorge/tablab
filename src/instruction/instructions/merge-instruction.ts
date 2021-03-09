import { InstructionBase } from '../core/instruction-base';
import { MergeableInstructionBase } from '../core/mergeable-instruction-base';
import { Tab } from '../../tab/tab';
import {
  FailedInstructionWriteResult,
  InstructionWriteResult,
  SuccessInstructionWriteResult,
} from '../core/instruction-write-result';
import {
  InvalidInstructionReason,
  InvalidInstructionReasonDescription,
} from '../enums/invalid-instruction-reason';
import { StringHelper } from '../../helpers/string-helper';

export class MergeInstruction extends InstructionBase {
  readonly instructions: MergeableInstructionBase[];

  constructor(instructions: MergeableInstructionBase[]) {
    super();

    this.instructions = instructions;
  }

  writeOnTab(tab: Tab): InstructionWriteResult {
    let result: InstructionWriteResult;

    const notes = this.instructions.map((instruction) => instruction.note);
    const notesOutOfTabStringsRange = notes.filter((note) => !tab.isNoteInStringsRange(note));
    if (notesOutOfTabStringsRange.length > 0) {
      result = this._getNotesStringOutOfTabRangeFailureResult(tab.rows);
    } else {
      try {
        tab.writeParallelNotes(notes);

        result = new SuccessInstructionWriteResult();
      } catch (e) {
        result = this.getUnmappepFailureResult();
      }
    }

    return result;
  }

  private _getNotesStringOutOfTabRangeFailureResult(
    maxTabStringValue: number
  ): FailedInstructionWriteResult {
    const failureReason = InvalidInstructionReason.MergeInstructionTargetsWithStringOutOfTabRange;
    const description = InvalidInstructionReasonDescription[failureReason];
    const failureMessage = StringHelper.format(description, [maxTabStringValue.toString()]);

    return new FailedInstructionWriteResult({
      failureReasonIdentifier: failureReason,
      failureMessage,
    });
  }
}
