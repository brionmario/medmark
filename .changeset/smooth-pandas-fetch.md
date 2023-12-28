---
'medmark-playground': minor
'medmark': minor
---

Add ability to init Medmark by executing `medmark init`.

```bash
medmark init
```
This will do the following.

- Create a `.medmark` folder at the root of the execution with the following folder structure.

```bash
├── .medmark
│   ├── medium-export # Should extract the medium archive here.
│   │   ├── .gitkeep
│   ├── templates # Should contain the templates for Medmark.
│   │   ├── sample-medmark-template.js
```
