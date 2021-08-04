# Technical debt

## @types/node outdated

-   Recorded by: Dailos Rafael Díaz Lara
-   Observed at: 2021, August 4
-   Impact (_if this tech debt affected your work somehow, add a +1 here with a date and optionally a note_):
    -   +1 Jane Doe 2021, March 26 (_this is an example of +1_)

### Updates

No updates.

### Problem

During a rutinary modules updating process, the [@types/node](https://www.npmjs.com/package/@types/node) module was updated to [v16.4.12](https://www.npmjs.com/package/@types/node/v/16.4.12).

After the update, several typing errors appeared in the Express server file, boud with the use of Helmet and several methods of the Body Parser module.

A research unveiled the issue was bound with this module and the quick solution was to downgrade to v14.14.45. This action removed the whole errors.

The issue open in the @types/node repository is this one: [Helmet + Express + Typescript = No overload matches this call error](https://github.com/helmetjs/helmet/issues/325).

### Why it was done this way?

Due to it's a third party library issue and based on it's a development module, to downgrade it was the easier option.

### Why this way is problematic?

Based on this situation only affects to development tasks, it doesn't really represent a threat to the project performance.

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
