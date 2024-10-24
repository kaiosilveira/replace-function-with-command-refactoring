import { score } from './index';

describe('score', () => {
  it('should return 0 if candidate is not a smoker and has a regular certification grade', () => {
    const candidate = { originState: 'FL' };
    const medicalExam = { isSmoker: false };
    const scoringGuide = { stateWithLowCertification: () => false };

    expect(score(candidate, medicalExam, scoringGuide)).toBe(0);
  });

  it('should return -5 if candidate is not a smoker and has a low certification grade', () => {
    const candidate = { originState: 'FL' };
    const medicalExam = { isSmoker: false };
    const scoringGuide = { stateWithLowCertification: () => true };

    expect(score(candidate, medicalExam, scoringGuide)).toBe(-5);
  });

  it('should return -5 if candidate is a smoker and has a regular certification grade', () => {
    const candidate = { originState: 'FL' };
    const medicalExam = { isSmoker: true };
    const scoringGuide = { stateWithLowCertification: () => false };

    expect(score(candidate, medicalExam, scoringGuide)).toBe(-5);
  });

  it('should return -10 if candidate is a smoker and has a low certification grade', () => {
    const candidate = { originState: 'FL' };
    const medicalExam = { isSmoker: true };
    const scoringGuide = { stateWithLowCertification: () => true };

    expect(score(candidate, medicalExam, scoringGuide)).toBe(-10);
  });
});
