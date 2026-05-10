# medmark

## 0.2.2

### Patch Changes

- [#25](https://github.com/brionmario/medmark/pull/25)
  [`d53a850`](https://github.com/brionmario/medmark/commit/d53a850e849e50d86a23986a62cb2ed536338353) Thanks
  [@brionmario](https://github.com/brionmario)! - Copy README to dist during build to be available in npm

## 0.2.1

### Patch Changes

- [`c154225`](https://github.com/brionmario/medmark/commit/c15422543b692910e619baeb1aaecd5525bd0e40) Thanks
  [@brionmario](https://github.com/brionmario)! - Restructured the repo with updated README's

## 0.2.0

### Minor Changes

- [#20](https://github.com/brionmario/medmark/pull/20)
  [`9ff5d76`](https://github.com/brionmario/medmark/commit/9ff5d7641811aa18154ca5802992b2feab5ddf8e) Thanks
  [@brionmario](https://github.com/brionmario)! - Add ability to init Medmark by executing `medmark init`.

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
