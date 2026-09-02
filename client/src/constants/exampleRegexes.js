export const EXAMPLE_REGEXES = [
  {
    category: 'Basics',
    examples: [
      { label: 'Literal match',   pattern: 'hello',       test: 'say hello world' },
      { label: 'Any character',   pattern: 'h.llo',       test: 'hello hallo hxllo' },
      { label: 'Alternation',     pattern: 'cat|dog',     test: 'I have a cat and a dog' },
    ]
  },
  {
    category: 'Quantifiers',
    examples: [
      { label: 'Zero or more (*)', pattern: 'ab*c',       test: 'ac abc abbc abbbc' },
      { label: 'One or more (+)',  pattern: 'ab+c',       test: 'ac abc abbc abbbc' },
      { label: 'Zero or one (?)', pattern: 'colou?r',     test: 'color colour' },
    ]
  },
  {
    category: 'Character Classes',
    examples: [
      { label: 'Digits',          pattern: '\\d+',        test: 'abc 123 def 456' },
      { label: 'Word chars',      pattern: '\\w+',        test: 'hello world 123' },
      { label: 'Custom class',    pattern: '[aeiou]',     test: 'regex is awesome' },
    ]
  },
  {
    category: 'Groups',
    examples: [
      { label: 'Capture group',   pattern: '(ab)+',       test: 'ab abab ababab' },
      { label: 'Email (simple)',  pattern: '[\\w]+@[\\w]+\\.[a-z]+', test: 'user@example.com admin@test.org' },
    ]
  },
]
