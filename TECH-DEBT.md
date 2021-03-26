# Technical debt

## @types/faker outdated

-   Recorded by: Dailos Rafael Díaz Lara
-   Observed at: 2021, March 26
-   Impact (_if this tech debt affected your work somehow, add a +1 here with a date and optionally a note_):
    -   +1 Jane Doe 2021, March 26 (_this is an example of +1_)

### Problem

During a rutinary modules updating process, the [Faker.js](https://github.com/Marak/Faker.js) module was updated from the [v5.1.0](https://github.com/Marak/faker.js/releases/tag/v5.1.0) to [v5.5.0](https://github.com/Marak/faker.js/releases/tag/v5.5.0).

At the moment to run the testing suite in order to verify that there wasn't any issue, a deprecation warning message appeared in the console:

```
Deprecation Warning: faker.random.uuid is now located in faker.datatype.uuid
```

After a try of applying the proposed change, it appeared an error reporting that the `datatype` namespace doesn't exist in the module.

The `Faker.js` module was inspected and it was confirmed that the new `datatype` namespace is included, so the conclusion is that the [@types/faker](https://www.npmjs.com/package/@types/faker) is not updated to the new features defined in the module yet.

In order to avoit this typing issue, it was executed a downgrading process, installing the [Faker.js v5.3.0](https://github.com/Marak/faker.js/releases/tag/v5.3.0).

Once it was done, the testing suite was run again and the warning message disappeared.

### Why it was done this way?

Due to this module is used only for development tasks and in addition, to fix an external dependency is not the goal of this project, it was decided to proceed this way.

### Why this way is problematic?

Based on this situation only affects to a few development tasks, it don't really represent a threat to the project performance.

### What the solution might be?

To check periodically it the types module has been updated in order to include the new defined features and if it's so, proceed with the modules updates.

### Why we aren't already doing the above?

Because the types module is not updated yet.

### Next steps

-   Take a look to the modules list shown in the dependencies checking process.
-   Update all available modules except this one.
-   Verify that the types modules alredy includes the new features.
-   If the new features are included in the types module, proceed with the full updating process.

### Other notes

There are no additional notes.
