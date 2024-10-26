export function score(candidate, medicalExam, scoringGuide) {
  return new Scorer(candidate, medicalExam).execute(scoringGuide);
}

export class Scorer {
  constructor(candidate, medicalExam) {
    this._candidate = candidate;
    this._medicalExam = medicalExam;
  }

  execute(scoringGuide) {
    let result = 0;
    let healthLevel = 0;
    let highMedicalRiskFlag = false;

    if (this._medicalExam.isSmoker) {
      healthLevel += 10;
      highMedicalRiskFlag = true;
    }

    let certificationGrade = 'regular';
    if (scoringGuide.stateWithLowCertification(this._candidate.originState)) {
      certificationGrade = 'low';
      result -= 5;
    }

    // lots more code like this
    result -= Math.max(healthLevel - 5, 0);

    return result;
  }
}
