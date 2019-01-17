## 0.4.0

- Revert fix introduced in 0.2.0, instead provide documentation and a way how to avoid such issues. Using nextTick causes loosing stack traces and is not the right way to fix this.

## 0.3.0

- Implement Do#complete
- Make error/success callbacks optional if complete is used

## 0.2.0

- Fix sync callbacks issue, more info in Do#done api description.

## 0.1.0

- Ensured success callback can be triggered only once.
