---
'medmark': patch
---

Accept a path dragged into the terminal.

Dragging a file onto a terminal inserts it the way a shell needs it: wrapped in quotes, or with its spaces
backslash-escaped. A prompt is not a shell, so those characters survived into the answer, a perfectly good absolute path
stopped being absolute, and it was joined onto the working directory:

```
Path not found: /Users/you/Desktop/medmark/'/Users/you/Downloads/medium-export (1).zip'
```

Quoting and escaping are now stripped from the paths given to `--input` and `--output`, and from the same values typed
at the prompt, including in the prompt's own validation, which runs first and would otherwise reject the path as you
enter it. Dragging the archive in is the most natural way to answer that question, especially since Medium's filenames
contain spaces and brackets, which is exactly what makes a shell quote them.

The prompt's placeholder now shows both shapes the answer can take:

```
medmark/medium-export  ·  ~/Downloads/medium-export-a1b2c3.zip
```

The workspace path alone gave no hint that the archive Medium emails you is accepted, or what it is called.
