# INT134 System Deployment
## Class 02 Managing Processes

### Lab Instructions

1. It is best to learn from experiment, read command help, and figure out the solution yourself.

2. Do not search for the answer on internet or use AI.

3. Do not ask or copy answers from your friend.

---

### Setup

1. Connect to `int134` vm with ssh.

2. Create a directory `~/int134/lab02/` under your home directory and change working directory to this directory.

3. Copy `/home/public/labs/lab02/answers.yaml` to `~/int134/lab02/answers.yaml`.

4. Modify `answers.yaml`: set your student ID and your full name.

---

### What this VM records about your work

While you work on this lab, your VM notes **how many minutes you were active** — nothing
more. A minute counts as active if **your terminal produced output** in that minute.

**What is recorded:** a count of active minutes, and nothing else.

**When:** during the class session, and afterwards until you have finished the lab or one
week has passed, whichever comes first.

**What is *not* recorded:** your commands, your keystrokes, your files, your IP address,
and anything at all during a minute when nobody is connected.

**Editing over VS Code Remote-SSH does not count.** VS Code is not recommended for this
course: its autocomplete frequently supplies the answer, which is not what you are here to
practise. It also opens no terminal of its own, so time spent editing files through it
earns no participation credit. Work at a terminal — including a terminal opened inside VS
Code, which counts normally.

**What it is used for:** your participation credit — which rewards working in class,
whether or not you finish — and measuring how long this lab really takes, so that future
labs are better sized.

You can read exactly what your own VM has recorded at any time:

```bash
cat /var/lib/int134/activity.log
cat /var/lib/int134/activity.counter
```

**These two files are the record of your participation. Altering them scores zero
participation for this lab.** Both are checked against each other, so an edit to either one
shows up. If you think the record is wrong — and it can be, this is software — **tell me**.
A mistake corrected is nothing; an edited file is academic dishonesty.

---

### Submission

1. Answer in `answers.yaml` file. Each answer goes inside a `|` block, and the
   indentation matters — the answer lines sit two spaces further in than their key:

    ```yaml
    answers:
      T1: |
        your answer here
    ```

2. Test your work using `int134 check lab02`. Run it as often as you like.

    ```bash
    $ int134 check lab02

      PASS  heartbeat.sh exists and is executable
      FAIL  int134-heartbeat is running now
            hint: Step 23. Enabled and active are different states — lab01 part 4.
      ...

      6 of 31 checks passed
    ```

    You will see how many checks passed, not a score.

3. A step with a question to answer is marked **→ `T<n>`**, which is the key to fill
   in `answers.yaml`. Steps without a mark still count — most of them are checked on
   your machine instead.

4. **`sudo` will ask for your password** in Part 4, several times. It is your own
   password, and nothing appears on screen as you type it.

&nbsp;

#### How to read this sheet

`<...>` hides the part you have to work out. Sometimes that is the command:

```bash
$ <...>
Listing... Done
```

and sometimes it is what the command prints:

```bash
$ id
uid=<...> gid=<...>
```

Everything not hidden is there to help you. The sample output shows you *where to
look* and *what shape the answer takes*, so you can tell a working system from a
broken one.

Several questions in Parts 2, 3 and 4 ask you to **watch what happens** and report it.
Those are answered with **`yes` or `no`** — a short sentence after it is fine, but the
`yes` or the `no` is the answer, and there is no way to work it out without running the
step.

&nbsp;


---

### Part 1 - Seeing what is running

Every question in this part is answered by looking. The misconception it attacks is
that **`ps` shows you the system** — on its own, `ps` shows you almost nothing:
only the processes attached to *your own terminal*. That is why "I ran `ps` and my
service wasn't there" is not evidence of anything.

| Command | What it reports |
| :--- | :--- |
| `ps` | Processes on **your terminal** only |
| `ps aux` | Every process on the machine, BSD style, with `%CPU` and `%MEM` |
| `ps -ef` | Every process, UNIX style, with the **`PPID`** column |
| `ps -o <cols> -p <pid>` | Choose your own columns for one process |
| `ps -C <name>` | Select by command name instead of pid |
| `pstree -p` | The same processes drawn as the tree they actually form |
| `pgrep -a <pattern>` | Find a process by name, without piping `ps` into `grep` |
| `top` / `htop` | The same information, refreshing. `q` quits |
| `ss -tln` | Which **ports** are listening |

Two identifiers appear throughout this lab, and confusing them makes Part 4 impossible:

```bash
$ ps -ef | head -2
UID          PID    PPID  C STIME TTY          TIME CMD
root           1       0  0 Aug05 ?        00:00:26 /sbin/init
              ^^^     ^^^^
              |       parent process id — who started it
              process id — this process
```

1. Run `ps` with no options at all. Two processes are listed, and one of them is
   `ps` itself. What is the other one? **→ `T1`**

    ```bash
    $ ps
        PID TTY          TIME CMD
      54754 pts/1    00:00:00 <...>
      54764 pts/1    00:00:00 ps
    ```

    *Only two, on a machine running well over a hundred. That is the point of the
    step: `ps` alone reports your terminal, not your system.*

2. Now list every process on the machine, both ways, and count them.

    ```bash
    $ ps aux | head -4
    USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
    root           1  0.0  0.3  22632 13932 ?        Ss   Aug05   0:26 /sbin/init
    root           2  0.0  0.0      0     0 ?        S    Aug05   0:00 [kthreadd]
    root           3  0.0  0.0      0     0 ?        S    Aug05   0:00 [pool_workqueue_release]
    $ ps aux | wc -l
    126
    $ ps -ef | head -2
    UID          PID    PPID  C STIME TTY          TIME CMD
    root           1       0  0 Aug05 ?        00:00:26 /sbin/init
    ```

    *`aux` and `-ef` are two different option styles doing nearly the same job — BSD
    and UNIX. `-ef` is the one with the `PPID` column, which is why the rest of this
    lab uses it. Your count will differ from 126.*

3. Your shell has a parent — the process that started it when you logged in. Find
   its `PPID`, then find out what that process is. What command is it? **→ `T3`**

    *Hint: `$$` is your own shell's pid. Look up the `PPID` it reports, then ask
    `ps` about that pid.*

    ```bash
    $ ps -o pid,ppid,user,stat,cmd -p $$
        PID    PPID USER     STAT CMD
      54754   54753 sysadmin S    <...>
    $ ps -o cmd= -p <the PPID from above>
    <...>
    ```

    *Give the command name, not the pid — the pid is different every time you log
    in, and the answer to this question is not.*

4. Which user does the `cron` service run as? **→ `T4`**

    ```bash
    $ ps -o user,pid,cmd -C cron
    USER         PID CMD
    <...>        819 /usr/sbin/cron -f -P
    ```

    *Worth remembering for class 3, when you meet a service that deliberately does
    **not** run as this user.*

5. Draw the process tree and find your own shell in it.

    ```bash
    $ pstree -p | head -6
    systemd(1)-+-ModemManager(904)-+-{ModemManager}(940)
               |                   |-{ModemManager}(945)
               |                   `-{ModemManager}(947)
               |-agetty(917)
               |-cron(819)
               |-dbus-daemon(820)
    ```

    *Everything on the machine hangs off one process at the far left. You met it in
    lab01 as pid 1; here you can see that it is not a fact about pid 1 but about
    every process — they all descend from it.*

6. List the listening ports. The system resolver listens on the address
   `127.0.0.53`. On which **port**? **→ `T6`**

    ```bash
    $ ss -tln
    State  Recv-Q Send-Q  Local Address:Port  Peer Address:Port
    LISTEN 0      4096    127.0.0.53%lo:<...>       0.0.0.0:*
    LISTEN 0      4096          0.0.0.0:22         0.0.0.0:*
    ```

    *Your list may have more lines than this. Port 22 is the one you are connected
    over. From class 3 onwards, this command is how you answer "is my server
    actually listening?" — and the answer is very often no.*

    *Try `ss -tlnp` as well. The extra `p` asks for the process behind each port,
    and you will find the column mostly empty: seeing who owns a port you do not own
    needs root.*

7. Run `top`. The first line ends with three load-average figures. They are averages
   over the last 1 minute, 5 minutes and how many minutes? **→ `T7`**

    ```bash
    $ top
    top - 00:15:30 up 6 days, 22:56,  1 user,  load average: 0.00, 0.00, 0.00
    Tasks: 125 total,   1 running, 124 sleeping,   0 stopped,   0 zombie
    %Cpu(s):  0.0 us,  0.0 sy,  0.0 ni,100.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
    MiB Mem :   3848.6 total,   2157.2 free,    527.2 used,   1444.6 buff/cache
    ```

    *Press `q` to quit — not `CTRL+C`, though that works too. `htop` is the same
    idea with colours and a mouse; both are installed.*

&nbsp;


---

### Part 2 - Your terminal owns your processes

**The misconception this part attacks:** that a program you started keeps running, and
keeps printing, once you have gone. Two different things can happen to it when your
session ends — **it can be killed, and its output can be lost** — and they are not the
same thing. One can happen without the other. The next five steps are experiments to
find out which happens when, and sorting them out is the single reason the rest of this
course exists.

*`SIGHUP` is the signal a terminal sends when it **hangs up** — the name is left over
from the days of modems. Which processes get it, and when, is what this part is about.*

| Command | What it does |
| :--- | :--- |
| `<cmd> &` | Start it in the **background** of this shell |
| `jobs` | Background jobs of **this shell**, numbered `%1`, `%2` … |
| `CTRL+C` | Send `SIGINT` — ask the foreground program to stop |
| `CTRL+Z` | **Suspend** the foreground program, leaving it stopped |
| `bg` | Resume a suspended job, in the background |
| `fg` | Bring a background job back to the foreground |
| `kill %1` | Kill by **job** number rather than by pid |
| `nohup <cmd> &` | Start it with `SIGHUP` ignored, and its output sent to a file |
| `shopt -s huponexit` | Ask **this shell** to hang up on its own jobs when it exits |
| `readlink /proc/<pid>/fd/1` | Where that process's standard output actually goes |

8. Create `heartbeat.sh` in `~/int134/lab02/`, with exactly this content, and make it
   executable.

    ```bash
    #!/usr/bin/env bash
    while true; do
        echo "heartbeat $(date '+%F %T')"
        sleep 5
    done
    ```

    ```bash
    $ ls -l heartbeat.sh
    -rwxrwxr-x 1 sysadmin sysadmin 91 Aug 12 13:40 heartbeat.sh
    ```

    *Note what it does with its output: it `echo`s to the screen and writes to no
    file at all. Where those lines end up changes twice in this lab, and that is the
    thread running through it.*

9. Run it in the foreground. Watch two or three heartbeats, then stop it with
   `CTRL+C`.

    ```bash
    $ ./heartbeat.sh
    heartbeat 2026-08-12 13:41:02
    heartbeat 2026-08-12 13:41:07
    ^C
    ```

    *Your shell was unusable while it ran. That is what "foreground" means.*

10. Now run it in the background with `&`, list your jobs, bring it back with `fg`,
    suspend it with `CTRL+Z`, resume it in the background with `bg`, and finally
    kill it by job number.

    ```bash
    $ ./heartbeat.sh &
    [1] 55012
    $ jobs
    [1]+  Running                 ./heartbeat.sh &
    $ fg
    ./heartbeat.sh
    heartbeat 2026-08-12 13:42:15
    ^Z
    [1]+  Stopped                 ./heartbeat.sh
    $ bg
    [1]+ ./heartbeat.sh &
    $ kill %1
    ```

    *`[1]` is the job number and `55012` is the pid — two different numbering
    systems for the same process. Job numbers exist only inside this one shell.*

11. Start it in the background with `&` again — and this time **redirect nothing**.
    Let it print straight to your terminal. Watch a heartbeat or two, then **log out
    completely** and log back in with ssh. Is it still running? **→ `T11`**

    ```bash
    $ ./heartbeat.sh &
    [1] 55120
    heartbeat 2026-08-12 13:45:02
    heartbeat 2026-08-12 13:45:07
    $ exit
    ```

    Log back in, then:

    ```bash
    $ pgrep -af heartbeat.sh
    <...>
    ```

    *The `-f` matters. Without it `pgrep` matches only the **process name**, which
    for a shell script is `bash` — so `pgrep -a heartbeat.sh` finds nothing whether
    your script is running or not. `-f` matches the whole command line.*

    *`pgrep` prints nothing and returns a non-zero status when it finds nothing.
    Silence from it is an answer either way, not a broken command.*

12. The shell that started it is gone. Find out what that process's parent process
    id is now. **→ `T12`**

    *No new command for this one. Step 3 asked you for your own shell's parent and
    you found it with `ps -o`; step 11 gave you a way to get the pid without typing
    it out. Put the two together.*

    *A process whose parent dies is not killed — it is **adopted**. Compare this
    `PPID` with the tree you drew in step 5, and with lab01's step 28.*

    *Write the pid down as well. Step 14 asks you to kill this one.*

13. Your script has been echoing a line every five seconds all this time, and those
    lines were going to the terminal you logged out of. Go and find them. Look in
    the lab directory first, then ask the process itself where its standard output
    actually points. Is anything collecting its output? **→ `T13`**

    ```bash
    $ readlink /proc/<the pid from step 12>/fd/1
    <...>
    ```

    *Listing the directory needs nothing you have not used since class 1. Only the
    second command is new.*

    *`/proc/<pid>/fd/1` is where a running process's standard output really goes —
    file descriptor 1 is stdout, and `/proc` will tell you about any process you
    own. Read the answer carefully: it names the terminal you started in, and then
    it tells you what has become of that terminal.*

    *Two separate things can go wrong when you leave: whether the process is still
    alive, and whether anything is still listening to it. Steps 11 and 13 are asking
    you about one each, and they do not have to have the same answer.*

14. Clean up, and then stop it happening again. First deal with the process from
    step 11 — kill it, using the pid you wrote down. Then start the script the same
    way once more, but ask this shell to hang up on its jobs before you leave. Log
    out, log back in. Is that one still running? **→ `T14`**

    ```bash
    $ kill <the pid you wrote down in step 12>
    $ shopt -s huponexit
    $ ./heartbeat.sh &
    [1] 55380
    $ exit
    ```

    Check it the same way you did in step 11, and read the result carefully.

    *`huponexit` is **off** by default, which is what step 11 was showing you. It
    belongs to one shell and one shell only: log in again and it is off again. So
    it is useful for tidiness and it is not how anything gets deployed. `shopt` on
    its own lists every option and whether it is set.*

    *There is a third way to leave, and you have almost certainly done it by
    accident: closing the window, or losing your connection. That is not a polite
    exit — the terminal hangs up, **bash itself** is sent `SIGHUP`, and an
    interactive bash that receives `SIGHUP` passes it on to its own jobs before it
    dies, whatever `huponexit` says. That is why "I logged out and my program died"
    and "I logged out and my program kept going" are both things people have seen.*

15. Sometimes you *do* want it to keep running — and you want to keep what it says.
    Start the script one more time with `nohup`, **read the line `nohup` prints
    before you do anything else**, log out, and log back in.

    Which file has been collecting its output this time? **→ `T15`**

    ```bash
    $ cd ~/int134/lab02
    $ nohup ./heartbeat.sh &
    [1] 55240
    nohup: ignoring input and appending output to '<...>'
    $ exit
    ```

    Log back in, check the process is still there the way step 11 taught you, then
    read the last few lines of that file. The timestamps keep advancing while you
    are not logged in.

    Now look at that file's permissions, and make it readable by your **group** as
    well — `ls -l` and `chmod` are both lab01 part 2.

    ```bash
    $ ls -l <...>
    -rw------- 1 sysadmin sysadmin 390 Aug 12 13:50 <...>
    ```

    *`nohup` creates this file private to you — mode `600`, nobody else at all.
    That is a sensible default and it is also why the checker cannot see it: it
    runs as a different account, in your group. This is lab01 part 2 again, on a
    file you did not create by hand.*

    *`nohup` did two separate things for you, and they are worth separating: it
    arranged for the program to ignore `SIGHUP`, and it gave the program's output
    somewhere to land that is not a terminal. Step 11 had neither of those, which
    is why it ended up the way it did.*

    ***Do not kill this one.*** *Step 29 refers back to it, and nothing later in
    this lab asks you to stop it.*

&nbsp;


---

### Part 3 - Signals

**The misconception this part attacks:** that `kill` kills. `kill` sends a *signal* —
a numbered message — and the one it sends by default is a **polite request** that a
program is entirely free to catch and ignore. Knowing this is what explains why
`systemctl stop` sometimes sits there for ninety seconds.

| Signal | Number | What it means |
| :--- | :--- | :--- |
| `SIGHUP` | 1 | Your terminal went away |
| `SIGINT` | 2 | `CTRL+C` — please stop |
| `SIGKILL` | 9 | Stop, now, by the kernel |
| `SIGTERM` | 15 | Please shut down cleanly |

| Command | What it does |
| :--- | :--- |
| `kill -l` | List every signal this system knows |
| `kill <pid>` | Send the **default** signal |
| `kill -9 <pid>` | Send signal 9 specifically |
| `pkill -f <pattern>` | Kill everything whose command line matches |
| `trap '<cmd>' TERM` | In a script: run `<cmd>` instead of dying on `SIGTERM` |

16. List the signals. Then find, in `man kill` or `help kill`, which signal number
    plain `kill` sends when you do not name one. **→ `T16`**

    ```bash
    $ kill -l
     1) SIGHUP	 2) SIGINT	 3) SIGQUIT	 4) SIGILL	 5) SIGTRAP
     6) SIGABRT	 7) SIGBUS	 8) SIGFPE	 9) SIGKILL	10) SIGUSR1
    11) SIGSEGV	12) SIGUSR2	13) SIGPIPE	14) SIGALRM	15) SIGTERM
    ...
    ```

    *The list tells you the numbers. It does not tell you which one is the default —
    that is in the manual.*

17. Create `stubborn.sh` in `~/int134/lab02/`, with exactly this content, and make it
    executable.

    ```bash
    #!/usr/bin/env bash
    trap 'echo "caught it — not going anywhere"' TERM
    while true; do
        sleep 1
    done
    ```

    *The `trap` line replaces the default behaviour for one signal. Everything else
    about the script is filler that keeps it alive so you have something to aim at.*

18. Run it in the background, note its pid, and send it the default signal. Watch
    what happens.

    ```bash
    $ ./stubborn.sh &
    [1] 55401
    $ kill 55401
    caught it — not going anywhere
    $ jobs
    [1]+  Running                 ./stubborn.sh &
    ```

    *You asked it to stop. It declined, and told you so. A real service does exactly
    this — it catches `SIGTERM` so it can finish writing to disk before exiting.*

19. Now send it signal 9 instead, and check again. Of the two commands you have now
    run against it, which one actually ended it? **→ `T19`**

    ```bash
    $ <...>
    $ jobs
    [1]+  Killed                  ./stubborn.sh
    ```

20. Steps 18 and 19 sent two different signals to the same script. One of them it
    was able to refuse; the other it was not. Which signal **number** was the one
    it could not catch, block or ignore? **→ `T20`**

    *This is why `kill -9` always works — and why it is the wrong thing to reach for
    first. A program killed this way gets no chance to close a file or finish a
    database write. Ninety seconds of `systemctl stop` waiting is systemd being
    polite before it does this.*

&nbsp;


---

### Part 4 - Hand it to systemd

**The misconception this part attacks:** that "it's running" is the same as "it's
deployed". Your `nohup` process from step 15 survives a logout. It will **not**
survive a reboot, nothing will restart it if it crashes, and no one but you knows it
is supposed to exist. Turning a program into a service fixes all three at once.

A unit file has three sections:

| Section | Holds |
| :--- | :--- |
| `[Unit]` | Description and ordering — what this is, and what it needs |
| `[Service]` | How to run it: the command, the user, what to do when it stops |
| `[Install]` | What `systemctl enable` should hook it to |

The directives you need:

| Directive | Section | What it does |
| :--- | :--- | :--- |
| `Description=` | `[Unit]` | The text `systemctl status` shows first |
| `ExecStart=` | `[Service]` | The command to run. **Absolute path** |
| `User=` | `[Service]` | Which account it runs as. Without it, root |
| `Restart=` | `[Service]` | `always` — bring it back whenever it stops |
| `WantedBy=` | `[Install]` | `multi-user.target` — the normal boot state |

21. Create `/etc/systemd/system/int134-heartbeat.service`. It must run **your**
    `heartbeat.sh` from step 8, as the `sysadmin` user, restarting always, and be
    installable into `multi-user.target`.

    ```ini
    [Unit]
    Description=<...>

    [Service]
    ExecStart=<...>
    User=<...>
    Restart=<...>

    [Install]
    WantedBy=<...>
    ```

    *You need `sudo` to write here, and it will ask for your password.*

    *`ExecStart` is where first unit files go wrong. systemd does not run your
    script from a shell: it does not expand `~`, it has no idea what directory you
    were in, and a relative path simply fails. Give it the full path, starting
    with `/`.*

22. Change the `Description` line to something else, save, and then run
    `systemctl status int134-heartbeat`. systemd prints a warning above the status.
    Which command does it tell you to run? **→ `T22`**

    ```bash
    $ systemctl status int134-heartbeat
    Warning: The unit file, source configuration file or drop-ins of
    int134-heartbeat.service changed on disk. Run '<...>' to reload units.
    ```

    *systemd read your unit file once and kept it in memory. Editing the file on
    disk does not change what systemd is running — this warning is it noticing the
    two have drifted apart.*

23. Run that command, then enable **and** start the service in one go with
    `sudo systemctl enable --now int134-heartbeat`.

    ```bash
    $ sudo systemctl enable --now int134-heartbeat
    Created symlink /etc/systemd/system/multi-user.target.wants/int134-heartbeat.service → /etc/systemd/system/int134-heartbeat.service.
    ```

    *That symlink is what `[Install] WantedBy=` was for, and it is the whole of what
    "enabled" means. Without an `[Install]` section there is nothing to link and
    `enable` fails.*

24. Check both states separately. What does `is-active` print? **→ `T24`**

    ```bash
    $ systemctl is-enabled int134-heartbeat
    enabled
    $ systemctl is-active int134-heartbeat
    <...>
    ```

    *Two independent states, exactly as in lab01 part 4 — except this time it is
    your own service.*

25. Look at the full status, note the **Main PID**, and find that same pid with `ps`.

    ```bash
    $ systemctl status int134-heartbeat
    ● int134-heartbeat.service - Heartbeat for INT134 lab02
         Loaded: loaded (/etc/systemd/system/int134-heartbeat.service; enabled; preset: enabled)
         Active: <...> since Wed 2026-08-12 14:20:11 +07; 30s ago
       Main PID: 55780 (heartbeat.sh)
    $ ps -o pid,ppid,user,cmd -p 55780
    ```

    *Note which user it is running as, and note its `PPID`. You have seen that
    number before, in step 12.*

26. Kill the main process outright — `sudo kill -9 <the Main PID>` — then look at
    the status again. Compare the Main PID with the one you noted: is it the same
    number, or a different one? **→ `T26`**

    ```bash
    $ sudo kill -9 55780
    $ systemctl status int134-heartbeat
         Active: <...> since Wed 2026-08-12 14:21:03 +07; 2s ago
       Main PID: <...> (heartbeat.sh)
    ```

    ***This is the step the whole lab is built towards.*** *You used the one signal
    that cannot be refused, and the service is still running. `Restart=always` is
    the difference between a program and a deployment: the service is not the
    process.*

27. Your script is still `echo`ing every five seconds — but not to your terminal,
    and not to `nohup.out` either. Find the command that shows a **service's**
    output. **→ `T27`**

    *Hint: `systemctl` manages units; a different command reads their logs. Name the
    unit when you run it, or you will get the whole system's log.*

    ```bash
    $ <...>
    Aug 12 14:21:03 int134 heartbeat.sh[55901]: heartbeat 2026-08-12 14:21:03
    Aug 12 14:21:08 int134 heartbeat.sh[55901]: heartbeat 2026-08-12 14:21:08
    Aug 12 14:21:13 int134 heartbeat.sh[55901]: heartbeat 2026-08-12 14:21:13
    ```

    *Same script, same `echo`, third destination: the terminal in step 9,
    `nohup.out` in step 15, and the system journal here. You never changed the
    script — you changed who was running it.*

    *`-n 20` shows the last twenty lines, `-f` follows live, and `--since "10 min ago"`
    takes a time. From class 3 on, this is where you will find out why your server
    will not start.*

28. Reboot the machine. Wait about a minute, log back in, and check the service.
    Is it running? **→ `T28`**

    ```bash
    $ sudo reboot
    Connection to int134 closed by remote host.
    ```

    ```bash
    $ systemctl is-active int134-heartbeat
    ```

    *You did not start it. Being **enabled** is what brought it back — the same
    distinction lab01 part 4 made with `cron`, now on a service you wrote.*

29. Check on the `nohup` process from step 15, which you left running. Is it still
    there? **→ `T29`**

    ```bash
    $ pgrep -af heartbeat.sh
    825 bash /home/sysadmin/int134/lab02/heartbeat.sh
    ```

    *Remember `-f` from step 11. Read that line carefully before answering: there
    were **two** copies of this script running before the reboot, and only one
    line comes back. Tell them apart by the path — systemd runs the absolute
    `ExecStart` path you gave it in step 21, while the one you started by hand in
    step 15 was `./heartbeat.sh`. The question is about that second one.*

    *Two copies of one script, started two ways, and only one of them came back.
    That difference is what the word "deployment" means in this course, and every
    remaining class assumes it.*

&nbsp;


---

### What is checked

`int134 check lab02` looks at two things: the state of your machine, and your answers.

**On your machine.** These need the work actually done, not described:

| Part | Checked |
| :--- | :--- |
| 1 | *nothing — see below* |
| 2 | `heartbeat.sh` exists and is executable; the file `nohup` created holds several heartbeats with different timestamps, and is group-readable |
| 3 | `stubborn.sh` exists and traps a signal |
| 4 | the unit file exists and has a `Description`, an absolute `ExecStart` naming your script, `User=sysadmin`, `Restart=`, and `WantedBy=multi-user.target`; the service is enabled; the service is active; the running process really is `heartbeat.sh`; its output is reaching the journal |

**From your answer file.** `T1`, `T3`, `T4`, `T6`, `T7`, `T11`, `T12`, `T13`, `T14`,
`T16`, `T19`, `T20`, `T22`, `T24`, `T26`, `T27`, `T28`, `T29`.

**Nothing in Part 1 is checked on the machine, and that is deliberate.** `ps`, `pstree`,
`top` and `ss` are pure observation — they leave nothing behind, so there is nothing for a
check to look at. The same applies to `CTRL+Z`, `fg` and `bg` in step 10: job control lives
inside one shell and vanishes with it.

Steps 18, 19 and 26 are not checked either, for a better reason: their end state is
identical to having done nothing. A stubborn script that has been killed and one that was
never started look the same, and `Restart=always` heals your `kill -9` within a second. What
you saw happen is evidence only you have — which is exactly why those steps are questions.
