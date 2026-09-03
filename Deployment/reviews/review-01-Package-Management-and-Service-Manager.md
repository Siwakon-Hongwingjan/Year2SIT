# Review: Class 1 — Package Management and Service Manager
INT134 System Deployment 2026

## สรุปเนื้อหาหลัก

### Course Overview (logistics)
- **Infrastructure course sequence**: INT130 → INT131/INT132/INT133/INT135 → **INT134 (this course, 2-credit)** + INT504 → INT136.
- **Course description**: deployment of web applications on a Linux VM — installing server software, configuring servers, building web apps with package managers and container technology, and troubleshooting.
- **Course Learning Outcomes (CLO)**: deploy a web application on a Linux VM; deploy a database server on a Linux VM; deploy web app + database server on containers; verify application deployment.
- **Schedule (tentative)**: 1) Package Management and Service Manager, 2) Managing Processes, 3) Deploy Static Web, 4) Deploy Backend and DBMS, 5) Reverse Proxy and Integration, Exam 1, 6) Introduction to Container, 7) Building Container Image, 8) Docker Compose, 9) Deploy Web Application with Containers, 10) Introduction to GitHub Action, Exam 2.
- **Evaluation**: 75% Exams (choices + practical), 20% Assignments/Participation (Menti, in-class, homework), 5% Attendance (onsite only, checked at classes 5/15/30).
- **Linux account/server**: hostname `lvm[xxyyy].sit.kmutt.ac.th` (xx = first 2 digits of student id, yyy = last 3 digits, e.g. `lvm68001`); OS Ubuntu 24.04 LTS x86; connect via `ssh`; username `sysadmin`; password from `@ad.sit.kmutt.ac.th` email; need KMUTT-VPN if off-campus.
- **Rules**: VM is for study only; do not use an insecure password; do not share your password; be careful with commands, especially with root privilege.

### 1. Linux Commands and Shell Navigation
- **Command line syntax**: `command_name [-option] [argument]`, e.g. `cp -v file1 file2`.
  - `command_name` — what operation to perform.
  - `option` — modifies how the command behaves: `-` for single-character options, `--` for GNU multi-character options.
  - `argument` — usually files/directories the command operates on.
- **Command history**:
  - `history` — print all command history; `history N` — print last N commands.
  - `!!` — last command; `!N` — command number N; `!-N` — command entered N commands ago; `!echo` — last command starting with "echo"; `!$` — last argument of last command; `!*` — all arguments of last command.
- **Autocomplete and command history in practice**: double **TAB** shows completion candidates (e.g. typing `log` + TAB TAB lists `logger`, `login`, `loginctl`, etc.); typing partial text + TAB autocompletes; `!N` or `!-N` reruns a numbered/relative history command; `!!` reruns the previous command. `CTRL+L` clears the screen.
- **Navigating command history** (keys): `UP`/`CTRL+p` — previous command; `DOWN`/`CTRL+n` — next command; `ALT+<` — jump to first command in history; `ALT+>` — jump to last command; `CTRL+r` — reverse search history; `CTRL+s` — forward search (requires `stty -ixon` first); `CTRL+g` — cancel search.
- **Moving the cursor**: `CTRL+a` — start of line; `CTRL+e` — end of line; `CTRL+f` — forward one character; `CTRL+b` — back one character; `ALT+f` — forward one word; `ALT+b` — back one word.
- **Delete, paste, and undo**: `CTRL+d` — delete current character; `CTRL+h` — delete character left of cursor; `CTRL+w` — delete word left of cursor; `CTRL+k` — delete everything right of cursor; `CTRL+u` — delete everything left of cursor; `CTRL+y` — paste text deleted with Ctrl+U/K/W; `CTRL+_` — undo.

### 2. Execute Command as root
- **`sudo`** ("superuser do") — execute a command as superuser or another user.
  - `-u` — run the command as the specified user.
  - `-s` — run the current shell as root.
  - Related: `su xxx` — substitute user xxx, designed for unprivileged users; `bash -c command_string` — execute a command string.
- **Exercise 1**: run `id`, `who am i`, `whoami` with `sudo`; create `tempdir` under `~/int134/lab01/` with `sudo`; create file `hello` inside `tempdir`.
- **Exercise 2**: change ownership of `tempdir` with `sudo chown -R sysadmin: ~/tempdir`; create user `test` with `sudo useradd -m -s /bin/bash test`; set `test`'s password to `mflv[`; find `test`'s uid/gid; add `test` to `sysadmin` group with `sudo usermod -aG sysadmin test`; verify group membership; allow `sysadmin` group to write to `tempdir`; switch to `test` user and create `testfile` in `tempdir`; exit `test` user; use `sudo -u` to create `testfile2` in `tempdir`; `sudo userdel -r test` can delete the user (but keep it for testing).

### 3. Package Management
- Applications live in **repositories**. Ubuntu components:
  - **main** — Canonical-supported free and open-source software.
  - **Universe** — community-maintained free and open-source software.
  - **Restricted** — proprietary drivers for devices.
  - **Multiverse** — software restricted by copyright or legal issues.
- **sources list (Ubuntu 24.04 LTS)**: repos/distributions are configured under `/etc/apt/sources.list.d/`. Each entry has `Types: deb`, `URIs:` (e.g. `http://th.archive.ubuntu.com/ubuntu/`), `Suites:` (e.g. `noble noble-updates noble-backports`, or `noble-security`), `Components:` (`main restricted universe multiverse`), `Signed-By:` (keyring path).
- **apt** vs **apt-get**: `apt` provides the end-user interface (suitable for interactive usage); `apt-get` (with `apt-cache`) is suitable for scripting.
- **apt / apt-get command table**:
  | apt | apt-get / apt-cache | meaning |
  |---|---|---|
  | `apt update` | `apt-get update` | update local package info from remote repos |
  | `apt upgrade` | `apt-get upgrade` | upgrade all packages to latest version |
  | `apt search foo` | `apt-cache search foo` | search packages with "foo" in name |
  | `apt show foo` | `apt-cache show foo` | show info about package foo |
  | `apt list --installed` | (none) | list installed packages |
  | `apt install foo` | `apt-get install foo` | download and install package foo |
  | `apt remove foo` | `apt-get remove foo` | remove package foo |
  | `apt purge foo` | `apt-get purge foo` | remove package foo and its configuration |
- **Exercise 3**: update meta-info; list installed packages; list upgradable packages; list all packages named `openssh`/`unzip` (`-a` for all); check download size of `unzip` version `6.0-28ubuntu4` (via `apt show`); install `unzip` and check version; install a specific version with `apt install unzip=6.0-28ubuntu4`; check if `unzip` is upgradable; upgrade `unzip` without specifying a version; confirm latest version is installed.

### 4. Service Manager
- **systemd** — the system and service manager for Linux. Runs as the first process on boot (PID 1) and acts as the init system that brings up and maintains userspace services. Separate instances start for logged-in users to run their own services. Usually installed as the `/sbin/init` symlink and started during early boot.
- **systemctl commands** — used to control services:
  | command | explanation |
  |---|---|
  | `systemctl status foo` | show status of service foo |
  | `systemctl start foo` | start service foo |
  | `systemctl restart foo` | stop and start service foo |
  | `systemctl reload foo` | reload service foo's configuration |
  | `systemctl stop foo` | stop service foo |
  | `systemctl enable foo` | enable service foo (start on boot) |
  | `systemctl disable foo` | disable service foo |
  | `reboot` | reboot, handled by systemd |
- **Exercise 4**: find which program runs first (PID 1, via `ps 1`); view overall system status (`systemctl status` without a service name); check ssh service status/enabled state; check whether `cron` is enabled/running (`systemctl is-enabled cron`, `systemctl is-active cron`); restart, disable, reboot, enable, and start `cron`, checking status after each step.
  - Note: starting with Ubuntu 24.04 LTS, `openssh-server` shifted to use **systemd socket activation** by default.

## Study guide

- **Command syntax pattern**: almost every Linux command follows `command_name [-option] [argument]`. Recognize `-` (single-char options, can be combined like `-la`) vs `--` (GNU long options, one word each, e.g. `--verbose`).
- **History expansion (`!`) is easy to confuse**:
  - `!N` = absolute history line number N; `!-N` = relative, N commands ago (not the same thing — a common point of confusion).
  - `!!` = shortcut for `!-1`.
  - `!$` grabs only the *last argument* of the previous command; `!*` grabs *all* arguments — students often mix these up.
- **`CTRL+s` forward search is disabled by default** in most terminals (it triggers XOFF flow control instead) — you must run `stty -ixon` before `CTRL+s` will work as "forward search history." This is a classic pitfall.
- **`sudo` vs `su`**: `sudo` runs a *single command* with elevated privileges (or, with `-s`, a whole elevated shell) without needing the root password — it uses *your own* password and the sudoers policy. `su xxx` switches to another user's identity entirely and normally needs *that user's* password. `sudo -u xxx` is the way to run a single command as another (non-root) user — used in Exercise 2 to create `testfile2` as `test` without fully switching users.
- **User/group workflow (Exercise 2)** mirrors a realistic sysadmin task: create a user (`useradd -m -s /bin/bash`), set a password, find uid/gid, add to a group (`usermod -aG`, note `-a` = append, forgetting `-a` overwrites existing group memberships — a very common pitfall), grant group write permission on a directory, then test as that user.
- **Repository components** (main/universe/restricted/multiverse) differ by *who maintains* them and *licensing*, not by *quality* — main/restricted are Canonical-supported, universe/multiverse are community-maintained; restricted/multiverse involve proprietary or legally-restricted software respectively.
- **`apt` vs `apt-get`**: functionally overlapping, but `apt` is meant for humans (better progress bars, colorized output, combines `apt-get` + `apt-cache` behaviors like `search`/`show`), while `apt-get`/`apt-cache` are the older, more stable interface preferred in scripts because their output/behavior is less likely to change between versions.
- **Pinning a package version**: `apt install foo=<version>` installs an exact version — useful when you need reproducibility instead of "whatever is latest."
- **`purge` vs `remove`**: `remove` uninstalls the package but leaves configuration files behind; `purge` removes the package *and* its configuration — a distinction that matters if you plan to reinstall cleanly later.
- **systemd is PID 1**: it's not just "a service manager" — it's the very first userspace process the kernel starts, and it supervises everything else, including creating separate instances per logged-in user session.
- **enable/disable vs start/stop are orthogonal**: `enable`/`disable` control whether a service starts automatically *on boot*; `start`/`stop` control whether it's running *right now*. A service can be enabled but not currently running, or running but not enabled — Exercise 4 walks through this directly (disable cron, reboot, check status; then enable and manually start it).
- **socket activation caveat**: since Ubuntu 24.04 LTS, `openssh-server`'s systemd unit uses socket activation, meaning `sshd` may show as "inactive" until a connection actually triggers it — don't assume "inactive" always means "broken."

## Flashcards

- Q: What is the general Linux command line syntax pattern? / A: `command_name [-option] [argument]`
- Q: What does `-` mean vs `--` in command options? / A: `-` is a single-character option; `--` is a GNU option with multiple characters
- Q: What does `!!` represent in bash history expansion? / A: The last command
- Q: What does `!$` represent? / A: The last argument from the last command
- Q: What does `!*` represent? / A: All arguments from the last command
- Q: What does `!-N` mean? / A: The command entered N commands ago
- Q: How do you jump to the first command in history? / A: `ALT + <`
- Q: How do you jump to the last command in history? / A: `ALT + >`
- Q: What key combo does a reverse search of command history? / A: `CTRL + r`
- Q: What must you run before `CTRL+s` (forward search) will work? / A: `stty -ixon`
- Q: What key moves the cursor to the start of the line? / A: `CTRL + a`
- Q: What key moves the cursor to the end of the line? / A: `CTRL + e`
- Q: What key deletes everything to the left of the cursor? / A: `CTRL + u`
- Q: What key deletes everything to the right of the cursor? / A: `CTRL + k`
- Q: What key pastes text deleted with Ctrl+U, K, or W? / A: `CTRL + y`
- Q: What key performs undo on the command line? / A: `CTRL + _`
- Q: What does `sudo` stand for? / A: superuser do
- Q: What sudo option runs the current shell as root? / A: `-s`
- Q: What sudo option runs the command as a specified user? / A: `-u`
- Q: What command substitutes/switches to another user (designed for unprivileged users)? / A: `su`
- Q: What flag on `usermod` appends a user to a group without removing them from existing groups? / A: `-aG` (as in `usermod -aG sysadmin test`)
- Q: Which Ubuntu repository component contains Canonical-supported free and open-source software? / A: main
- Q: Which Ubuntu repository component contains community-maintained free and open-source software? / A: Universe
- Q: Which Ubuntu repository component contains proprietary drivers for devices? / A: Restricted
- Q: Which Ubuntu repository component contains software restricted by copyright or legal issues? / A: Multiverse
- Q: Where are Ubuntu 24.04's repo/distribution configs stored? / A: `/etc/apt/sources.list.d/`
- Q: Which tool is preferred for interactive use, `apt` or `apt-get`? / A: `apt`
- Q: Which tool is preferred for scripting, `apt` or `apt-get`? / A: `apt-get`
- Q: What is the apt command to update local package info from remote repositories? / A: `apt update`
- Q: What is the apt-cache equivalent of `apt search foo`? / A: `apt-cache search foo`
- Q: What is the difference between `apt remove foo` and `apt purge foo`? / A: `remove` keeps configuration files, `purge` removes the package and its configuration
- Q: How do you install a specific version of a package with apt? / A: `apt install foo=<version>`
- Q: What is systemd? / A: A system and service manager for Linux operating systems
- Q: What PID does systemd run as when it is the init system? / A: PID 1
- Q: Where is systemd usually installed as a symlink? / A: `/sbin/init`
- Q: What command shows the status of a service named foo? / A: `systemctl status foo`
- Q: What is the difference between `systemctl restart foo` and `systemctl reload foo`? / A: restart stops and starts the service; reload just reloads its configuration
- Q: What is the difference between `systemctl enable` and `systemctl start`? / A: enable makes the service start automatically on boot; start runs it right now
- Q: What commands check if cron is enabled and active respectively? / A: `systemctl is-enabled cron` and `systemctl is-active cron`
- Q: Since Ubuntu 24.04 LTS, what activation method does openssh-server use by default? / A: systemd socket activation

## Quiz

ทำแบบทดสอบพร้อมเช็คคำตอบทันที: python3 quiz.py reviews/quiz-01.json
