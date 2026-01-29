# Path Standards Tools

## Overview
This directory contains tools for maintaining path format standards in project documentation.

## Available Scripts

### 1. Validation Script
```bash
./.opencode/scripts/check-path-standards.sh
```
**Purpose**: Scans project documentation to detect path format violations  
**Output**: Colored validation report showing pass/fail status

### 2. Fix Script  
```bash
./.opencode/scripts/fix-path-standards.sh
```
**Purpose**: Automatically fixes absolute path issues in documentation  
**Safety**: Creates backup files automatically, supports rollback

## Usage Workflow

### Regular Maintenance
1. **Periodic Check**: Run `./check-path-standards.sh`
2. **When Issues Found**: Run `./fix-path-standards.sh`  
3. **Verify Fixes**: Run the validation script again

### CI/CD Integration
Add the validation script to your CI pipeline:
```yaml
- name: Path Standards Check
  run: ./.opencode/scripts/check-path-standards.sh
```

### Clean Up Backups
After confirming fixes are correct:
```bash
find .opencode/ -name '*.backup' -delete
```

## Standards Reference
For detailed path usage guidelines, see: `.opencode/rules/path-standards.md`