[![Continuous Integration](https://github.com/kaiosilveira/replace-function-with-command-refactoring/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/replace-function-with-command-refactoring/actions/workflows/ci.yml)

ℹ️ _This repository is part of my Refactoring catalog based on Fowler's book with the same title. Please see [kaiosilveira/refactoring](https://github.com/kaiosilveira/refactoring) for more details._

---

# Replace Function With Command

**Formerly: Replace Method with Method Object**

<table>
<thead>
<th>Before</th>
<th>After</th>
</thead>
<tbody>
<tr>
<td>

```javascript
function score(candidate, medicalExam, scoringGuide) {
  let result = 0;
  let healthLevel = 0;
  // long body code
}
```

</td>

<td>

```javascript
class Scorer {
  constructor(candidate, medicalExam, scoringGuide) {
    this._candidate = candidate;
    this._medicalExam = medicalExam;
    this._scoringGuide = scoringGuide;
  }

  execute() {
    this._result = 0;
    this._healthLevel = 0;
    // long body code
  }
}
```

</td>
</tr>
</tbody>
</table>

**Inverse of: [Replace Command with Function](https://github.com/kaiosilveira/replace-command-with-function-refactoring)**

Nested functions are a useful tool in most cases but, sometimes, we need extra control over variables and readability. That's when this refactoring comes in handy.

## Working example

Our working example consists of a program that calculates a health score for an insurance company. It goes like this:

```javascript
export function score(candidate, medicalExam, scoringGuide) {
  let result = 0;
  let healthLevel = 0;
  let highMedicalRiskFlag = false;
  if (medicalExam.isSmoker) {
    healthLevel += 10;
    highMedicalRiskFlag = true;
  }
  let certificationGrade = 'regular';
  if (scoringGuide.stateWithLowCertification(candidate.originState)) {
    certificationGrade = 'low';
    result -= 5;
  }
  // lots more code like this
  result -= Math.max(healthLevel - 5, 0);
  return result;
}
```

Our goal here is to make the `score` function into a [command](https://github.com/kaiosilveira/design-patterns/tree/main/command), so we can isolate the processing into chunks, making the function more legible and probably more testable as well.

### Test suite

The test suite covers all possible bifurcations of the aforementioned function, and it is somewhat extensive. To see the full implementation, please refer to [src/index.test.js](./src/index.test.js).

### Steps

We start by introducing a `Scorer` class:

```diff
+export class Scorer {
+  execute(candidate, medicalExam, scoringGuide) {
+    let result = 0;
+    let healthLevel = 0;
+    let highMedicalRiskFlag = false;
+
+    if (medicalExam.isSmoker) {
+      healthLevel += 10;
+      highMedicalRiskFlag = true;
+    }
+
+    let certificationGrade = 'regular';
+    if (scoringGuide.stateWithLowCertification(candidate.originState)) {
+      certificationGrade = 'low';
+      result -= 5;
+    }
+
+    // lots more code like this
+    result -= Math.max(healthLevel - 5, 0);
+
+    return result;
+  }
+}
```

Then, we [inline](https://github.com/kaiosilveira/inline-function-refactoring) `Scorer.execute` at the body of `score`:

```diff
 export function score(candidate, medicalExam, scoringGuide) {
-  let result = 0;
-  let healthLevel = 0;
-  let highMedicalRiskFlag = false;
-
-  if (medicalExam.isSmoker) {
-    healthLevel += 10;
-    highMedicalRiskFlag = true;
-  }
-
-  let certificationGrade = 'regular';
-  if (scoringGuide.stateWithLowCertification(candidate.originState)) {
-    certificationGrade = 'low';
-    result -= 5;
-  }
-
-  // lots more code like this
-  result -= Math.max(healthLevel - 5, 0);
-
-  return result;
+  return new Scorer().execute(candidate, medicalExam, scoringGuide);
 }
```

Then, since the command's only raison d'être is to execute the scoring logic, it's somewhat more semantic to have the function's arguments as part of its constructor. We start by moving `candidate`:

```diff
+++ b/src/index.js
@@ -1,9 +1,13 @@
 export function score(candidate, medicalExam, scoringGuide) {
-  return new Scorer().execute(candidate, medicalExam, scoringGuide);
+  return new Scorer(candidate).execute(medicalExam, scoringGuide);
 }

 export class Scorer {
-  execute(candidate, medicalExam, scoringGuide) {
+  constructor(candidate) {
+    this._candidate = candidate;
+  }
+
+  execute(medicalExam, scoringGuide) {
     let result = 0;
     let healthLevel = 0;
     let highMedicalRiskFlag = false;
     let certificationGrade = 'regular';
-    if (scoringGuide.stateWithLowCertification(candidate.originState)) {
+    if (scoringGuide.stateWithLowCertification(this._candidate.originState)) {
       certificationGrade = 'low';
       result -= 5;
     }
```

Then, we do the same for `medicalExam`:

```diff
 export function score(candidate, medicalExam, scoringGuide) {
-  return new Scorer(candidate).execute(medicalExam, scoringGuide);
+  return new Scorer(candidate, medicalExam).execute(scoringGuide);
 }
 export class Scorer {
-  constructor(candidate) {
+  constructor(candidate, medicalExam) {
     this._candidate = candidate;
+    this._medicalExam = medicalExam;
   }
-  execute(medicalExam, scoringGuide) {
+  execute(scoringGuide) {
     let result = 0;
     let healthLevel = 0;
     let highMedicalRiskFlag = false;
-    if (medicalExam.isSmoker) {
+    if (this._medicalExam.isSmoker) {
       healthLevel += 10;
       highMedicalRiskFlag = true;
     }
```

And the last one is `scoringGuide`:

```diff
 export function score(candidate, medicalExam, scoringGuide) {
-  return new Scorer(candidate, medicalExam).execute(scoringGuide);
+  return new Scorer(candidate, medicalExam, scoringGuide).execute();
 }
 export class Scorer {
-  constructor(candidate, medicalExam) {
+  constructor(candidate, medicalExam, scoringGuide) {
     this._candidate = candidate;
     this._medicalExam = medicalExam;
+    this._scoringGuide = scoringGuide;
   }
-  execute(scoringGuide) {
+  execute() {
     let result = 0;
     let healthLevel = 0;
     let highMedicalRiskFlag = false;
     let certificationGrade = 'regular';
-    if (scoringGuide.stateWithLowCertification(this._candidate.originState)) {
+    if (this._scoringGuide.stateWithLowCertification(this._candidate.originState)) {
       certificationGrade = 'low';
       result -= 5;
     }
```

Now, on to the inner refactorings. Since our goal is to break the processing down into smaller chunks, we need to make the internal variables widely accessible, and we can accomplish this by turning them into class members. We start with `result`:

```diff
   execute() {
-    let result = 0;
+    this._result = 0;
     let healthLevel = 0;
     let highMedicalRiskFlag = false;
     let certificationGrade = 'regular';
     if (this._scoringGuide.stateWithLowCertification(this._candidate.originState)) {
       certificationGrade = 'low';
-      result -= 5;
+      this._result -= 5;
     }
     // lots more code like this
-    result -= Math.max(healthLevel - 5, 0);
+    this._result -= Math.max(healthLevel - 5, 0);
-    return result;
+    return this._result;
   }
 }
```

Then `healthLevel`:

```diff
   execute() {
     this._result = 0;
-    let healthLevel = 0;
+    this._healthLevel = 0;
     let highMedicalRiskFlag = false;
     if (this._medicalExam.isSmoker) {
-      healthLevel += 10;
+      this._healthLevel += 10;
       highMedicalRiskFlag = true;
     }
     // lots more code like this
-    this._result -= Math.max(healthLevel - 5, 0);
+    this._result -= Math.max(this._healthLevel - 5, 0);
     return this._result;
   }
```

And then `highMedicalRiskFlag`:

```diff
   execute() {
     this._result = 0;
     this._healthLevel = 0;
-    let highMedicalRiskFlag = false;
+    this._highMedicalRiskFlag = false;
     if (this._medicalExam.isSmoker) {
       this._healthLevel += 10;
-      highMedicalRiskFlag = true;
+      this._highMedicalRiskFlag = true;
     }
     let certificationGrade = 'regular';
```

And, finally, `certificationGrade`:

```diff
-    let certificationGrade = 'regular';
+    this._certificationGrade = 'regular';
     if (this._scoringGuide.stateWithLowCertification(this._candidate.originState)) {
-      certificationGrade = 'low';
+      this._certificationGrade = 'low';
       this._result -= 5;
     }
```

Now we're able to start the chunking. Our example is `scoreSmoking`:

```diff
     execute() {
-    if (this._medicalExam.isSmoker) {
-      this._healthLevel += 10;
-      this._highMedicalRiskFlag = true;
-    }
+    this.scoreSmoking();
   }

+  scoreSmoking() {
+    if (this._medicalExam.isSmoker) {
+      this._healthLevel += 10;
+      this._highMedicalRiskFlag = true;
+    }
+  }
 }
```

And that's it for this one! The function is now more ligible and can become more readable as well.

### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                                                           | Message                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| [3310680](https://github.com/kaiosilveira/replace-function-with-command-refactoring/commit/3310680db031412cf0b87160b335976ea32b48db) | introduce `Scorer` class                                   |
| [c982d35](https://github.com/kaiosilveira/replace-function-with-command-refactoring/commit/c982d35f07364977eb0704b2679f721f191f2796) | call `Scorer.execute` at the body of `score`               |
| [f8408b4](https://github.com/kaiosilveira/replace-function-with-command-refactoring/commit/f8408b4690f690e568e5bfdc5ceafed9bab0e78e) | move `candidate` argument to `Score`'s constructor         |
| [091533c](https://github.com/kaiosilveira/replace-function-with-command-refactoring/commit/091533c15dc03a53c98bf1434cb1a4ee84b3fce4) | move `medicalExam` to `Score`'s constructor                |
| [20b234e](https://github.com/kaiosilveira/replace-function-with-command-refactoring/commit/20b234e39640ed5469eab550e329e783f635d2e2) | move `scoringGuide` to `Score`'s constructor               |
| [10aa4f7](https://github.com/kaiosilveira/replace-function-with-command-refactoring/commit/10aa4f7792523199c33d9aea33d8d991b722564e) | make `result` an instance variable at `Score`              |
| [eda5940](https://github.com/kaiosilveira/replace-function-with-command-refactoring/commit/eda594099ce1b4e4687189f3289822929e2a27c2) | make `healthLevel` an instance variable at `Score`         |
| [d172cde](https://github.com/kaiosilveira/replace-function-with-command-refactoring/commit/d172cde23d41c832739bfbe645d0c87e5b9a62f5) | make `highMedicalRiskFlag` an instance variable at `Score` |
| [b979164](https://github.com/kaiosilveira/replace-function-with-command-refactoring/commit/b979164d07f04ae53012b3ca1157cc78c189c9c1) | make `certificationGrade` an instance variable at `Score`  |
| [28a43a9](https://github.com/kaiosilveira/replace-function-with-command-refactoring/commit/28a43a9654631562873fce636094c1b0d1f485a3) | extract `scoreSmoking` function at `Score`                 |

For the full commit history for this project, check the [Commit History tab](https://github.com/kaiosilveira/replace-function-with-command-refactoring/commits/main).
