# Synthetic demo document

`follow-up.pdf` is a synthetic, text-only test fixture, not a real medical record. The test identifier `11111111111` is fictional and explicitly labelled.

Expected extraction: category `zdravstvo`, document date `2026-07-15`, literal quote `Kontrola za 6 mjeseci.`, interval 6 months. Code should calculate reminder `2026-10-15` and due date `2027-01-15`.

Once Step 0 passes and Step 1 is deployed, upload through the existing Documents screen. Reupload the same file to check duplicate rejection. For Step 2, ask `Koji mi je OIB?` and check that the response uses only the fictional identifier in this fixture and identifies its source. Do not use real identity or medical data for development verification.

This fixture has not yet been uploaded. Phone camera acceptance needs a photograph of the printed fixture on the actual phone; a desktop PDF upload does not verify that criterion.
