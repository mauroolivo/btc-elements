import { spawnSync } from 'node:child_process';

const severityRank = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  UNKNOWN: 4,
};

const trivyArgs = [
  'fs',
  '--quiet',
  '--scanners',
  'vuln',
  '--severity',
  'HIGH,CRITICAL',
  '--pkg-types',
  'library',
  '--format',
  'json',
  '.',
];

const result = spawnSync('trivy', trivyArgs, {
  encoding: 'utf8',
});

if (result.error) {
  console.error('pre-push: failed to execute trivy');
  console.error(result.error.message);
  process.exit(1);
}

const stdout = result.stdout?.trim() ?? '';
const stderr = result.stderr?.trim() ?? '';

let report;

try {
  report = stdout ? JSON.parse(stdout) : { Results: [] };
} catch {
  console.error('pre-push: trivy returned unreadable output');
  if (stderr) console.error(stderr);
  if (stdout) console.error(stdout);
  process.exit(result.status ?? 1);
}

const findings = (report.Results ?? [])
  .flatMap((targetResult) =>
    (targetResult.Vulnerabilities ?? []).map((vulnerability) => ({
      target: targetResult.Target,
      library: vulnerability.PkgName,
      severity: vulnerability.Severity,
      vulnerabilityId: vulnerability.VulnerabilityID,
      installedVersion: vulnerability.InstalledVersion,
      fixedVersion: vulnerability.FixedVersion || 'no fix published',
      title: vulnerability.Title,
    }))
  )
  .sort(
    (left, right) =>
      (severityRank[left.severity] ?? 99) - (severityRank[right.severity] ?? 99)
  );

if (findings.length === 0) {
  console.log('pre-push: security scan passed');
  process.exit(0);
}

const byLibrary = new Map();

for (const finding of findings) {
  const key = `${finding.target}:${finding.library}:${finding.installedVersion}:${finding.fixedVersion}`;
  const existing = byLibrary.get(key);

  if (existing) {
    existing.vulnerabilities.push(finding);
    continue;
  }

  byLibrary.set(key, {
    target: finding.target,
    library: finding.library,
    installedVersion: finding.installedVersion,
    fixedVersion: finding.fixedVersion,
    vulnerabilities: [finding],
  });
}

console.error('pre-push: security scan failed');
console.error(
  `found ${findings.length} HIGH/CRITICAL vulnerabilities across ${byLibrary.size} affected dependency group(s)`
);

for (const group of byLibrary.values()) {
  console.error('');
  console.error(
    `${group.library}@${group.installedVersion} in ${group.target} -> fixed in ${group.fixedVersion}`
  );

  for (const vulnerability of group.vulnerabilities) {
    console.error(
      `  - ${vulnerability.vulnerabilityId} [${vulnerability.severity}] ${vulnerability.title}`
    );
  }
}

if (stderr) {
  console.error('');
  console.error(stderr);
}

console.error('');
console.error('run `npm run security:scan` for the full Trivy report');
process.exit(1);
