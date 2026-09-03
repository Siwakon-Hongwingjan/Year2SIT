# INT134 System Deployment
## Class 04 Deploy Backend and DBMS — After Class

### What this sheet is

In class you deployed the **school** register: a database, a scoped user, an application
with dependencies and a schema, and a systemd service in front of it. This sheet asks you
to do the same thing again, **on your own**, for **your noticeboard** — the application you
have been building since class 3.

**It is deliberately shorter than the class sheet, and it explains almost nothing.** The
explanations are in `lab04class`, which stays on your VM and on `/home/public`. Go back to
it whenever you need to; that is what it is for. What is not here is here on purpose —
looking a command up and typing it again is the part that makes it stick, and reading a
second copy of the same paragraph is not.

**If you missed the class, do `lab04class` first.** It has no deadline and carries no mark,
and two of the questions below need the school database to exist.

---

### Lab instructions

1. It is best to learn from experiment, read command help, and figure out the solution
   yourself.

2. Do not search for the answer on the internet or use AI.

3. Do not ask or copy answers from your friend.

---

### Setup

1. Connect to your `int134` VM with ssh.

2. Create a directory `~/int134/lab04/` under your home directory and change working
   directory to it.

3. Copy `/home/public/labs/lab04/answers.yaml` to `~/int134/lab04/answers.yaml`.

4. Modify `answers.yaml`: set your student ID and your full name.

**You need your class 3 deployment and your class 4 one.** This lab continues both: the
noticeboard where class 3 left it, and the school deployment from the class 4 walkthrough,
still on the same machine. If either is broken, fix it first.

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

1. Answer in the `answers.yaml` file. Each answer goes inside a `|` block, and the
   indentation matters — the answer lines sit two spaces further in than their key:

    ```yaml
    answers:
      T4a: |
        your answer here
    ```

    *Most steps ask one question and its key is the step number — `T9` is step 9. **Step 4
    asks three**, so its keys carry a letter as well: `T4a`, `T4b`, `T4c`. Each is marked on
    its own, so getting two of the three is worth two of the three.*

2. Test your work using `int134 check lab04`. Run it as often as you like.

3. A step with a question to answer is marked **→ `T<n>`**. Steps without a mark still
   count — most of them are checked on your machine instead.

4. **Two steps here are supposed to look wrong.** Steps 9 and 12 ask you to look at something
   before it works, or to break something on purpose. The output *is* the answer.

5. **`sudo` will ask for your password.**

&nbsp;

#### Names you must get exactly right

Nothing below is a guessing game. Where a name has to match, it is written here:

| | |
| :--- | :--- |
| Application directory | `/srv/noticeboard` — where class 3 put it |
| Database and user | `noticeboard` |
| Unit file | `/etc/systemd/system/noticeboard-api.service` |
| Port | `3000` — the noticeboard's, not the one you used in class |

*You now have **two** applications on this machine and they share nothing: not a directory,
not a database, not a user, not a unit file, not a port. That is the normal situation on a
real server, and keeping the two apart is most of what this lab is about.*

&nbsp;

#### Two things you cannot get back

- **Step 9** — how many notices are in the table *before* you add one.
- **Step 12** — what Node says when the port is already taken. It only says it while the
  service is running.

**Write each one down as you reach it.**

&nbsp;

> **No question on this sheet asks for your database password, or for any part of it, or
> for which characters it contains — and none ever will.** It goes in one file on your VM
> and nowhere else.

&nbsp;


---

### Part 1 - Readiness

*From the class 4 walkthrough. Nothing to do here if you did it; a few marks if you did.*

1. Confirm on your VM that **MySQL 8 is installed, enabled and running**, that it is **not**
   listening on a public address, and that **Node.js 22 or newer** is installed.

    *If any of those is not true: `lab04class` **part 1** installs MySQL and shows you the
    address it listens on, and **part 3, step 11** installs Node. Come back here afterwards.*

&nbsp;


---

### Part 2 - A database and a user for the noticeboard

*Same procedure as `lab04class` **part 2, steps 6 to 8**, with different names — and the
statements themselves are in the table at the top of that part. Look it up if you need it.
The one difference: in class a script did it for you, and here you type the statements
yourself.*

2. Create a database called `noticeboard`, with the character set that can store any
   character.

3. Create the user `'noticeboard'@'localhost'`, and **let the server generate the
   password** as it did in class. Grant it privileges on the `noticeboard` database and
   nothing else.

    ***Copy the generated password somewhere safe before you press anything else.*** *The
    server shows it once. If you lose it,
    `ALTER USER 'noticeboard'@'localhost' IDENTIFIED BY RANDOM PASSWORD;` gives you a new
    one.*

    ***This is a second, different credential. Do not give it the school user's password,
    and do not give it one you invented.*** *Two services that share a credential are one
    service as far as an attacker is concerned: whoever reads either `.env` file now holds
    both databases. Letting the server generate each one separately is what makes them
    independent, and it costs you nothing.*

4. Check your work: ask the server what that user may do, and satisfy yourself that the
   second line is scoped to one database and nothing else. You asked exactly this question
   in class; the command is not repeated here.

    Then answer this. You cannot get that generated password back. Suppose you lost it
    tomorrow, with the application already deployed and running. **Three separate answers,
    one line each, and no prose in any of them:**

    | What to write | |
    | :--- | :--- |
    | the **SQL statement** that issues a new password | **→ `T4a`** |
    | the **full path of the file** that has to change as well | **→ `T4b`** |
    | the **command** that makes the running service use it | **→ `T4c`** |

    ***The middle one is the question; the other two are here because they are the rest of
    the chain.*** *This password lives in **two** places and only one of them is in MySQL. An
    operator who changes it there and stops has taken their own application down, and will
    not find out until the next restart.*

5. Connect **as that user** — not as the administrator, or the step proves nothing — and
   list the databases. Your machine now holds two application databases.

    **Answer in exactly this shape** — the list as the server printed it, then the database
    that is on this server and is not in your list: **→ `T5`**

    ```
    Can see:  <...>
    Missing:  <...>
    ```

    *One line of why, if you want to, but those two lines are the answer. The missing one is
    the reason we do not hand an application the administrator account, and it is the whole
    of Part 2 in a single observation.*

&nbsp;


---

### Part 3 - Dependencies and schema

*Steps 6 and 7 are `lab04class` **part 3, steps 12 and 13** with different names — look them
up. **Step 8 is where this lab stops being a repeat:** your noticeboard's schema arrives a
completely different way from the school's, and the class sheet does not cover it.*

6. Install the noticeboard backend's dependencies, exactly as recorded — not the versions
   that happen to exist today.

7. Create the application's configuration from the example beside it, and make sure nobody
   else on the machine can read it. It needs your database URL, your student number, and
   `HOST=0.0.0.0`.

    *If the next step refuses, or the service will not start later, read the error before
    you change anything. You have met it before, in class, and the fix is not in the GRANT.*

    *The noticeboard uses port `3000` and it is the application's own default, so you may
    leave `PORT` out. Setting it to `3000` explicitly is better practice and the checker
    does not care either way.*

8. **This application carries its own schema.** Before you run anything, read it — from
   `/srv/noticeboard/backend`, which is where the rest of this part happens:

    ```bash
    $ cat prisma/migrations/20260819000000_init/migration.sql
    ```

    It is plain SQL — a `CREATE TABLE` — written by Prisma when the application was
    developed, and shipped in the archive ever since. **A migration is just a file of SQL
    with a timestamp in its name and a record of whether it has been run.**

    *This is the opposite of class. The school's table came from `db/schema.sql`, which you
    ran yourself, and Prisma turned up afterwards as a client that only checked the two
    agreed. Here there is no `db/` directory and no table: the migration **is** the schema,
    and Prisma is what applies it. Both are real, and which one you are standing in is
    decided by where the application came from — not by you.*

    Two subcommands, and only one of them is an operator's:

    | | |
    | :--- | :--- |
    | `npx prisma migrate dev` | a **developer's** command. It works out what changed in the schema and **writes a new migration** — which is why it first tries to build a scratch database of its own, and why it refused to run for you in class — `lab04class` part 3, steps 14 to 16, and the scratch database is step 16 |
    | `npx prisma migrate deploy` | an **operator's** command. It applies the migrations that already exist, in order, and creates nothing |

    You are deploying, not developing. Run the operator's one, then build the client the
    application's code imports — the same `generate` as class.

    ```bash
    $ npx prisma migrate deploy
    <...>
    All migrations have been successfully applied.

    $ npx prisma generate
    ```

    Now go and look at what it actually did, in MySQL, as the `noticeboard` user — the same
    way you connected in step 5. List the tables. **There are two of them, and the migration
    only asked for one. What is the other one called?** **→ `T8`**

    *You did not create it and the migration does not mention it. Look inside it: one row per
    migration that has been applied, with a checksum and the time it ran. That is how
    `migrate deploy` knows — on this machine, on the next one, and next month — what it has
    already done and what is still outstanding. **A tool that changes your database keeps its
    own notes in your database**, and knowing where they are is the difference between
    diagnosing a failed deployment and guessing at one.*

9. Still as that same user, **describe the `notices` table** and compare its columns with
    the `CREATE TABLE` you just read: the same table, arrived by a different route.

    Then count what is in it. **Before you add anything at all**, and before the optional
    exercise at step 15 — **how many rows are in `notices`?** **→ `T9`**

    *The school register had rows in it by this point in class. Whether this one does is the
    question — count them, and do not assume either way.*


&nbsp;


---

### Part 4 - Run it as a service

10. Write `/etc/systemd/system/noticeboard-api.service` and reload systemd.

    It must run the backend's `server.js` under `node`, from the `backend` directory, as
    `sysadmin`, taking its configuration from the file you wrote in step 7, restarting
    always, ordered after the network **and the database**, and installable into
    `multi-user.target`. Give it the same `RestartSec=` and the same four sandboxing lines
    you gave `school-api.service` in `lab04class` part 4, step 19 — they are not different
    for this application, and the question below is about the lines that *are*.

    Now open it beside the one you wrote in class, `school-api.service`, and read the two
    of them line by line. Apart from `Description=`, **which two directives have different
    values?** **→ `T10`**

    *Read them; do not diff them. A tool that hands you the answer teaches you nothing about
    a unit file, and there will be a day when the two files are on different machines.*

    *Look carefully at `ExecStart=` while you are there, and be sure you can say why it is
    what it is in both files.*

    ***And notice what is not in either of them: `ExecReload=`.*** *In class 3 you kept typing
    `sudo systemctl reload nginx`, and it worked — because nginx's packaged unit carries an
    `ExecReload=` line telling systemd how to ask it to re-read its configuration. Yours has
    none, so `systemctl reload` on it answers `Job type reload is not applicable for unit
    …` and does nothing at all. **A service can only be reloaded if somebody wrote down how**,
    and until then the way to make it pick up a changed configuration is to stop and start
    it. Worth checking against your own answers earlier in this sheet.*

11. Enable and start it, then check both states.

12. **With the service running**, start a second copy by hand from the backend directory
    and read what happens. Which error does Node print? **→ `T12`**

    ```bash
    $ cd /srv/noticeboard/backend
    $ node server.js
    ```

    *Press `Ctrl+C` when you have read it. Nothing is broken and your service is fine — it
    is still running, which is exactly why this happened.*

    *A port belongs to one process at a time. This is the failure you will meet the first
    time you deploy two applications on one machine and give them the same number, and it
    is worth meeting once on purpose.*

13. Ask the API whether it is alive. What does it report as `student`? **→ `T13`**

14. Add **two** notices through the API, both with your student number as the `author`.
    The messages are given, because the next step has to tell them apart:
    `My first notice`, then `My second notice`.

    A notice has exactly **two** fields and the API refuses anything with one missing. The
    request is the same shape as the POST you sent in class — `lab04class` part 4, step 23 —
    and only the field names differ. They are the same two names class 3 served straight off
    the disk in `/srv/noticeboard/frontend/data/notices.json`: the board has not changed
    shape, only where it keeps its notices.

    ```bash
    $ curl -s -X POST -H 'Content-Type: application/json' \
        -d '{"author":"<your student number>","message":"My first notice"}' \
        http://127.0.0.1:3000/api/notices
    {"id":1,"author":"...","message":"My first notice","createdAt":"2026-08-27T03:24:36.778Z"}
    ```

    *Then send the second one the same way, with `My second notice`. Read what comes back
    each time — **the server chooses the `id`, not you**, and you are about to need one of
    them.*

15. Ask the API for the whole board and find the `id` it gave `My first notice`. **Delete
    that notice, then send the very same DELETE a second time.** What were the two
    statuses? **→ `T15`**

    ```bash
    $ curl -s http://127.0.0.1:3000/api/notices

    $ curl -s -i -X DELETE http://127.0.0.1:3000/api/notices/<that id> | head -1
    HTTP/1.1 <...>

    $ curl -s -i -X DELETE http://127.0.0.1:3000/api/notices/<that id> | head -1
    HTTP/1.1 <...>
    ```

    *The board comes back **newest first**, so the notice you want is not the one at the
    top. This is why the two messages are different: you have to read the list and pick,
    which is what you will be doing every time you meet an API you did not write.*

    *`-i` is there because a successful DELETE answers with **no body at all**. Without it
    `curl` prints nothing and you cannot tell whether anything happened.*

    *Two identical requests, two different answers. **The two status codes are the answer** —
    write both. A line saying why they differ is worth understanding and is not what is
    marked, so add it only if you want to.*

    *Delete the wrong one, or forget to write the codes down? POST another notice and do it
    again. Nothing here is precious — that is what a test deployment is for.*

    > **Leave `My second notice` where it is.** That notice is what proves your API can
    > **write** and not only read, and a check looks for a notice carrying your student
    > number as its `author`. The notices in the optional exercise below are somebody
    > else's — they cannot stand in for it, and neither can a row you insert with SQL.
    > **Do it with the POST.**

    &nbsp;

    ***Optional, and nothing checks it.*** *Your board shipped with three notices in
    `/srv/noticeboard/frontend/data/notices.json`, which is where they lived before you had a
    database. Putting those same three into the `notices` table is exactly what `seed.sql`
    did in class, and **MySQL Workbench will import and export table data for you** — working
    out how is the exercise. Do it once the marked work is finished, **after** you have answered
    `T9` and not before, and it does not replace the notice you left above.*

16. Open port `3000` and confirm from **your own computer** that your API answers.

    ```
    http://<your-vm>.sit.kmutt.ac.th:3000/api/health
    ```

    *You now have three ports open on this machine. In class 5 you will close two of them,
    on purpose, and both applications will keep working — which is the argument for the
    thing class 5 is about.*

&nbsp;


---

### What is checked

**On your machine.**

| Part | Checked |
| :--- | :--- |
| 1 | MySQL 8 installed, enabled and running; the database **not** on a public address; Node 22 or newer |
| 3 | the application and its `node_modules`; `.env` exists and is not world-readable; **its database password is not the one your class 4 deployment uses**; the migration ships and its client is generated — whether you *applied* it is proved in Part 4, because the API cannot answer for notices without the table |
| 4 | the unit file exists and does **not** run as root; the service is enabled and active; something is listening on 3000; the API answers and reports your student number; **a notice authored by your student number comes back through the API** — `My second notice`, the one step 15 tells you to leave there |

**From my server.** Your API answers from outside, and your notices are readable from
outside.

**From your answer file.** `T4a`, `T4b`, `T4c`, `T5`, `T8`, `T9`, `T10`, `T12`, `T13`, `T15`.

**Part 1 is worth very few marks.** You did that work in class and it is not paid for twice.
It is checked because a machine that has lost it cannot do the rest.

**Your database password is never transmitted, stored, or asked for, and no question on
this sheet wants it.** One check does *open* the two configuration files, on your own
machine and nowhere else: it compares the two deployments' passwords and reports a single
word — they differ, or they do not. Neither password, nor any part of either, is printed,
sent anywhere, or written down. Every other check `stat`s `.env` for its permissions and
never opens it.

**The database is not checked directly either.** Its credentials are in that same file. It
is proved through the API instead — and specifically through a notice carrying **your own
student number**, which is what the POST at step 14 puts there. Rows loaded straight into the
table with SQL — the optional import at step 15 included, since those notices carry somebody
else's name — prove that the checker can read. They do not prove that your API can write, and
that is the half of a deployment this lab exists to add.

**Your class 4 deployment is not checked here, and is not touched.** `lab04class` checks
that one. Two of the questions above need it to exist, and so does the password comparison
— which simply passes if you have not deployed it. Nothing here changes it.

**Nothing here will break in class 5.** That class rebinds the API to this machine only and
closes port 3000 — so no check requires the public address, and the probes from my server
accept your API on port 3000 **or** through the reverse proxy you are about to build.

&nbsp;


---

### Without the sheet

This is the same lab with the steps taken away — the deployment stated as seven outcomes.
If you can work through this list without looking back at the steps, you can do this job.

- MySQL 8 is installed, it starts at boot, it is running now, and nothing outside this
  machine can reach it.
- A database called `noticeboard` exists, in a character set that can store any character,
  and a user of the same name may do as it likes inside it and nothing at all outside it.
- That user's password was chosen by the server, is not the one the school deployment uses,
  and exists in exactly one file on the machine — which nobody but its owner can read.
- The backend's dependencies are installed from the lockfile rather than from whatever is
  newest, the schema that shipped with the application has been applied by the operator's
  Prisma command rather than the developer's, and the client the code imports has been
  generated on this machine.
- A unit file you wrote runs the API as `sysadmin` and not as `root`, from the backend
  directory, taking its configuration from that one file; it starts at boot, it is running
  now, and it comes back by itself if it dies.
- The API answers on port `3000`, reports your student number, and both reads and writes
  notices — they survive a restart of the service, because the service is not where they
  live.
- Somebody at another machine can ask your API whether it is alive, and can read your board.

Nothing here is new and nothing here is extra. It is worth ten minutes at the end, because
it is how the lab exam will be written: an outcome, a machine, and no list of commands.
