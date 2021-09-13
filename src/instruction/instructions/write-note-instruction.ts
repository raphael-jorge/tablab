import { MergeableInstruction } from './mergeable-instruction';
import { Note } from '../../tab/note';
import { Tab } from '../../tab/tab';
import {
  FailedInstructionWriteResult,
  InstructionWriteResult,
  SuccessInstructionWriteResult,
} from '../instruction-write-result';
import { StringHelper } from '../../helpers/string-helper';
import {
  InvalidInstructionReason,
  InvalidInstructionReasonDescription,
} from '../enums/invalid-instruction-reason';

export class WriteNoteInstruction extends MergeableInstruction {
  /**
   * Creates a write note instruction instance.
   * @param note - The note to be written to the tablature.
   */
  constructor(note: Note) {
    super(note);
  }

  /**
   * Writes the `note` to the given tablature.
   * @param tab - The tablature to write the note.
   * @returns The result of the writing operation.
   */
  protected internalWriteOnTab(tab: Tab): InstructionWriteResult {
    let result: InstructionWriteResult;

    if (tab.isNoteWritable(this.note)) {
      tab.writeNote(this.note);

      result = new SuccessInstructionWriteResult();
    } else {
      result = this._getNonWritableNoteFailureResult(tab.numberOfStrings);
    }

    return result;
  }

  private _getNonWritableNoteFailureResult(
    maxTabStringValue: number
  ): FailedInstructionWriteResult {
    const failureReason = InvalidInstructionReason.BasicInstructionWithNonWritableNote;
    const description = InvalidInstructionReasonDescription[failureReason];
    const failureMessage = StringHelper.format(description, [maxTabStringValue.toString()]);

    return new FailedInstructionWriteResult({
      failureReasonIdentifier: failureReason,
      failureMessage,
    });
  }
}
