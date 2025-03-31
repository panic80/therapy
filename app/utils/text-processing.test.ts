import { cleanAndTruncateText } from './text-processing';

describe('cleanAndTruncateText', () => {
  // Test cases for null, undefined, and empty inputs
  test('should return an empty string for null input', () => {
    expect(cleanAndTruncateText(null as any)).toBe(''); // Use 'as any' to bypass TS type check for test
  });

  test('should return an empty string for undefined input', () => {
    expect(cleanAndTruncateText(undefined as any)).toBe(''); // Use 'as any' for test
  });

  test('should return an empty string for empty string input', () => {
    expect(cleanAndTruncateText('')).toBe('');
  });

  // Test cases for basic cleaning
  test('should remove control characters', () => {
    expect(cleanAndTruncateText('text with \u0001 control \u001F chars')).toBe('text with control chars');
  });

  test('should replace line/paragraph separators with spaces', () => {
    expect(cleanAndTruncateText('line1\u2028line2\u2029line3')).toBe('line1 line2 line3');
  });

  test('should remove disallowed characters but keep allowed punctuation and brackets due to regex', () => {
    // Note: The regex [^\p{L}\p{N}\s.,!?;:'"()\-\]]/gu keeps ']' - likely a typo, should be '\"()\-'?
    expect(cleanAndTruncateText('Keep: letters, numbers 123, spaces, .,!?;:\'"()- and ]. Remove: @#$%^&*_+={}[]<>~`')).toBe('Keep letters numbers 123 spaces .,!?;:\'"()- and ]. Remove');
  });

   test('should keep Unicode letters and numbers', () => {
    expect(cleanAndTruncateText('???? résumé 123')).toBe('???? résumé 123');
  });

  // Test cases for whitespace normalization
  test('should normalize multiple spaces, tabs, and newlines to single spaces', () => {
    expect(cleanAndTruncateText('  extra   spaces\t tab\nnewline ')).toBe('extra spaces tab newline');
  });

  test('should trim leading and trailing whitespace', () => {
    expect(cleanAndTruncateText('  leading and trailing space   ')).toBe('leading and trailing space');
  });

  // Test cases for punctuation normalization
  test('should normalize repeated punctuation', () => {
    expect(cleanAndTruncateText('Wow!!! That\'s great... right??? No,, just kidding;;')).toBe('Wow! That\'s great. right? No, just kidding;');
  });
  
  test('should normalize other repeated punctuation', () => {
    expect(cleanAndTruncateText('Section:: Title-- Sub\'\'title""')).toBe('Section: Title- Sub\'title"');
  });

  test('should handle mixed cleaning and normalization', () => {
     expect(cleanAndTruncateText('  Test   with... multiple   issues!!  \n End.  ')).toBe('Test with. multiple issues! End.');
  });

  // Test cases for truncation
  test('should not truncate if text length is less than maxLength', () => {
    expect(cleanAndTruncateText('Short text', 20)).toBe('Short text');
  });

  test('should not truncate if text length is equal to maxLength', () => {
    expect(cleanAndTruncateText('Exactly twenty chars', 20)).toBe('Exactly twenty chars');
  });

  test('should truncate text longer than maxLength at the last word boundary', () => {
    expect(cleanAndTruncateText('This is a longer text that needs truncation', 25)).toBe('This is a longer text'); // Truncates before ' that'
  });

  test('should perform hard truncation if no space is found before maxLength', () => {
    expect(cleanAndTruncateText('LongWordWithoutSpacesHere', 10)).toBe('LongWordWi'); // Hard cut
  });
  
  test('should perform hard truncation if the only space is at index 0 (after trim)', () => {
    // This scenario is less likely due to trim() before length check, but testing completeness
     expect(cleanAndTruncateText(' LongWord', 5)).toBe('LongW'); // Assuming trim happens first, length is 8. Sub(0,5)='LongW'. lastSpace= -1. returns 'LongW'
  });

  test('should handle truncation correctly when the last word boundary is exactly at maxLength (edge case)', () => {
    // Function substring(0, maxLength) excludes char at maxLength. lastIndexOf(' ') finds last space *within* that substring.
    expect(cleanAndTruncateText('Cut here please right now', 16)).toBe('Cut here please'); // Substring(0, 16) is 'Cut here please '. lastSpaceIndex is 15. Returns substring(0, 15) which is 'Cut here please'. Final trim removes potential space.
  });

  test('should handle truncation with maxLength 0', () => {
    expect(cleanAndTruncateText('Some text', 0)).toBe(''); // Substring(0, 0) is '', returns ''
  });
  
  test('should handle truncation with punctuation normalization near boundary', () => {
      expect(cleanAndTruncateText('Truncate here... please!!! Okay??', 20)).toBe('Truncate here. please'); // Normalizes first, then truncates 'Truncate here. please! Okay?' at word boundary before ' Okay?'
  });

  test('should handle text with only allowed punctuation', () => {
    expect(cleanAndTruncateText('.,!?;:\'"()-')).toBe('.,!?;:\'"()-');
  });
   
  test('should return empty string after cleaning if only disallowed chars present', () => {
    expect(cleanAndTruncateText('@#$%^&*')).toBe('');
  });

});