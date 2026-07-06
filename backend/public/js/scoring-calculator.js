/**
 * Scoring Calculator v2.0 - Hierarchical Aspect-based Scoring
 * Implements 4-level hierarchy: Equipment → Tests → Aspects → Sub-Aspects
 */

class ScoringCalculator {
  constructor() {
    this.aspects = [];
    this.subAspects = [];
    this.scores = {}; // { sub_aspect_code: score }
    this.thresholds = {};
  }

  /**
   * Load aspects for a methodology
   */
  async loadAspects(methodologyCode) {
    try {
      const response = await fetch(`/api/scoring/aspects?methodology_code=${methodologyCode}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      this.aspects = data || [];
      return this.aspects;
    } catch (error) {
      console.error("Error loading aspects:", error);
      return [];
    }
  }

  /**
   * Calculate aspect score from sub-aspect scores
   * Formula: Σ(Sub-aspect Score × Weight) / Σ Weight
   */
  calculateAspectScore(aspectCode) {
    const aspect = this.aspects.find((a) => (a.code || a.Code) === aspectCode);
    if (!aspect || !(aspect.sub_aspects || aspect.SubAspects)) return null;

    let weightedSum = 0;
    let totalWeight = 0;
    let count = 0;

    const subAspects = aspect.sub_aspects || aspect.SubAspects || [];
    for (const subAspect of subAspects) {
      const subCode = subAspect.code || subAspect.Code;
      const score = this.scores[subCode];
      if (score !== undefined && score !== null && score !== "") {
        weightedSum += parseFloat(score) * subAspect.weight;
        totalWeight += subAspect.weight;
        count++;
      }
    }

    if (count === 0) return null; // No scores entered yet

    if (totalWeight === 0) return 0;
    return parseFloat((weightedSum / totalWeight).toFixed(2));
  }

  /**
   * Calculate final score from aspect scores
   * Formula: Σ(Aspect Score × Weight) / Σ Weight
   */
  calculateFinalScore() {
    let weightedSum = 0;
    let totalWeight = 0;
    let count = 0;

    for (const aspect of this.aspects) {
      const aspectScore = this.calculateAspectScore(aspect.code || aspect.Code);
      if (aspectScore !== null) {
        weightedSum += parseFloat(aspectScore) * (aspect.weight || aspect.Weight);
        totalWeight += aspect.weight;
        count++;
      }
    }

    if (count === 0) return null;
    if (totalWeight === 0) return 0;

    return parseFloat((weightedSum / totalWeight).toFixed(2));
  }

  /**
   * Validate all aspects meet threshold (HARD FAILURE RULE)
   * Returns: { passed: boolean, failedAspects: [...] }
   */
  validateAspectThresholds() {
    const failedAspects = [];
    let allPassed = true;

    for (const aspect of this.aspects) {
      const aspectCode = aspect.code || aspect.Code;
      const score = this.calculateAspectScore(aspectCode);
      const threshold = aspect.threshold || aspect.Threshold || 60;

      if (score === null) {
        // Scores not yet complete
        continue;
      }

      if (parseFloat(score) < threshold) {
        allPassed = false;
        failedAspects.push({
          code: aspectCode,
          name: aspect.name || aspect.Name,
          score: parseFloat(score),
          threshold: threshold,
          difference: (threshold - parseFloat(score)).toFixed(2),
        });
      }
    }

    return { passed: allPassed, failedAspects };
  }

  /**
   * Get aspect with all its sub-aspects and scores
   */
  getAspectDetails(aspectCode) {
    const aspect = this.aspects.find((a) => (a.code || a.Code) === aspectCode);
    if (!aspect) return null;

    const score = this.calculateAspectScore(aspectCode);
    const threshold = aspect.threshold || aspect.Threshold || 60;
    const isPassed = score ? parseFloat(score) >= threshold : null;

    const subAspects = aspect.sub_aspects || aspect.SubAspects || [];

    return {
      ...aspect,
      calculatedScore: score,
      threshold,
      isPassed,
      subAspectsWithScores:
        subAspects.map((sub) => ({
          ...sub,
          score: this.scores[sub.code || sub.Code] || 0,
        })) || [],
    };
  }

  /**
   * Get all aspect details
   */
  getAllAspectsDetails() {
    return this.aspects.map((aspect) => this.getAspectDetails(aspect.code || aspect.Code));
  }

  /**
   * Set sub-aspect score
   */
  setSubAspectScore(subAspectCode, score) {
    if (score === "" || score === null) {
      delete this.scores[subAspectCode];
    } else {
      this.scores[subAspectCode] = Math.max(0, Math.min(100, parseFloat(score)));
    }
  }

  /**
   * Get all entered scores
   */
  getScores() {
    return this.scores;
  }

  /**
   * Clear all scores
   */
  clearScores() {
    this.scores = {};
  }

  /**
   * Check if all sub-aspects have scores
   */
  areAllSubAspectsScored() {
    let totalSubAspects = 0;
    let scoredSubAspects = 0;

    for (const aspect of this.aspects) {
      const subAspects = aspect.sub_aspects || aspect.SubAspects || [];
      for (const sub of subAspects) {
        totalSubAspects++;
        const subCode = sub.code || sub.Code;
        if (this.scores[subCode] !== undefined && this.scores[subCode] !== null && this.scores[subCode] !== "") {
          scoredSubAspects++;
        }
      }
    }

    return { all: scoredSubAspects === totalSubAspects, total: totalSubAspects, scored: scoredSubAspects };
  }

  /**
   * Generate HTML for aspect score display with color coding
   */
  getAspectScoreHTML(aspectCode) {
    const details = this.getAspectDetails(aspectCode);
    if (!details) return "";

    if (details.calculatedScore === null) {
      return `<span style="color:#94a3b8; font-size:0.85rem;">-</span>`;
    }

    const score = parseFloat(details.calculatedScore);
    let bgColor = "#10b981"; // Green - passed
    let textColor = "#047857";

    if (!details.isPassed) {
      bgColor = "#ef4444"; // Red - failed
      textColor = "#7f1d1d";
    } else if (score < 75) {
      bgColor = "#f59e0b"; // Orange - warning
      textColor = "#9a3412";
    }

    return `
            <div style="background:${bgColor}20; border:2px solid ${bgColor}; padding:4px 8px; border-radius:4px; text-align:center;">
                <div style="font-weight:bold; color:${textColor}; font-size:1rem;">${score.toFixed(2)}</div>
                <div style="font-size:0.7rem; color:${textColor};">${score >= details.threshold ? "✓ Pass" : "✗ Fail"}</div>
            </div>
        `;
  }

  /**
   * Generate detailed breakdown HTML
   */
  generateBreakdownHTML() {
    let html = '<div style="font-size:0.9rem;">';

    for (const aspect of this.aspects) {
      const aspectCode = aspect.code || aspect.Code;
      const details = this.getAspectDetails(aspectCode);
      const score = details.calculatedScore;
      const isPassed = details.isPassed;

      html += `
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 8px; border-left: 4px solid ${isPassed ? "#10b981" : "#ef4444"};">
                    <div style="font-weight:bold; margin-bottom:0.5rem; color: #1e293b;">
                        ${aspect.code} - ${aspect.name}
                        <span style="float:right; font-size:1.1rem; font-weight:800; color: ${isPassed ? "#10b981" : "#ef4444"};">
                            ${score || "-"}
                        </span>
                    </div>
                    <div style="font-size:0.8rem; color:#64748b; margin-bottom:0.5rem;">
                        Threshold: ${aspect.threshold || 60} | Weight: ${aspect.weight}
                    </div>
            `;

      const subAspects = aspect.sub_aspects || aspect.SubAspects || [];
      if (subAspects.length > 0) {
        html += '<div style="margin-left:1rem; padding-left:1rem; border-left:1px solid #94a3b8;">';
        for (const sub of subAspects) {
          const subCode = sub.code || sub.Code;
          const subScore = this.scores[subCode] || "-";
          html += `
                        <div style="padding:0.3rem 0; color:#475569;">
                            <span style="font-weight:500;">${sub.code} - ${sub.name}:</span>
                            ${subScore} (Weight: ${sub.weight})
                        </div>
                    `;
        }
        html += "</div>";
      }

      html += "</div>";
    }

    html += "</div>";
    return html;
  }
}

// Export for use in HTML
window.ScoringCalculator = ScoringCalculator;
