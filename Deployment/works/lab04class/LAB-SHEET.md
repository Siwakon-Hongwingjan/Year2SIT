# INT134 System Deployment
## Class 04 Deploy Backend and DBMS — During Class

### What this session is

We do this one **during class**. I will explain the material and the tasks; you run it on
your own VM as we go. Ask questions at any point — that is what the afternoon is for.

Today we deploy a **different application** from the one you have been working on: a small
student register, called `school`. It has a database behind it, which the noticeboard did
not.

There is a second sheet, `lab04`, which you do **on your own after class**. It carries the
mark, and it asks you to do all of this again on the **noticeboard** — your application,
the one from class 3. This sheet does not carry a mark: it exists so that the work you do
in this room is recorded, and your participation credit comes from it.

**Nothing you do today is thrown away.** In class 5 you will put a reverse proxy in front
of both applications, and this one will answer at `/school/`.

---

### Setup

1. Connect to your `int134` VM with ssh.

2. Create a directory `~/int134/lab04class/` under your home directory and change working
   directory to it.

3. Copy `/home/public/labs/lab04class/answers.yaml` to `~/int134/lab04class/answers.yaml`.

4. Modify `answers.yaml`: set your student ID and your full name.

5. **Put today's application on the machine.** It arrives as an archive,
   `/home/public/labs/lab04class/school.tar.gz`, the same shape as your noticeboard in class 3
   and for the same reasons. Three tasks, and only the first has a command you have not met:

    - Make `/srv/school` **before anything goes into it** — **owned by you**, group `sysadmin`,
      mode **2775**. You need `sudo` to create anything under `/srv`, and it has to stop being
      root's.
    - Unpack the archive into it, **without `sudo`**, dropping the archive's own top-level
      folder as it goes — `--strip-components=1`, or you end up with
      `/srv/school/school/backend`, one directory too deep.
    - Then give the group write **wherever you can write**, throughout the tree and not only on
      the top directory itself.

    ```bash
    $ sudo install -d -o sysadmin -g sysadmin -m 2775 /srv/school
    $ ls -ld /srv/school
    drwxrwsr-x 2 sysadmin sysadmin 4096 Aug 26 14:05 /srv/school

    # unpack the archive into it, one directory level and not two
    $ ls -l /srv/school
    total 12
    drwxr-sr-x 3 sysadmin sysadmin 4096 Aug 25 14:56 backend
    drwxr-sr-x 2 sysadmin sysadmin 4096 Aug 25 14:56 db
    drwxr-sr-x 2 sysadmin sysadmin 4096 Aug 25 14:57 frontend

    # add group-write wherever the OWNER can already write
    $ ls -l /srv/school
    total 12
    drwxrwsr-x 3 sysadmin sysadmin 4096 Aug 25 14:56 backend
    drwxrwsr-x 2 sysadmin sysadmin 4096 Aug 25 14:56 db
    drwxrwsr-x 2 sysadmin sysadmin 4096 Aug 25 14:57 frontend
    ```

    ***`install` is new, and it is the one command here worth learning today.*** *In class 3 you
    made `/srv/noticeboard` with three commands — `mkdir`, then `chown`, then `chmod`. `install
    -d` is those three at once:*

    | Option | What it does |
    | :--- | :--- |
    | `-d` | make **d**irectories, rather than copy a file |
    | `-o <user>` | set the **o**wner. Needs `sudo`, which is why the line has one |
    | `-g <group>` | set the **g**roup |
    | `-m <mode>` | set the mode — here `2775`, setgid and group-writable |

    *Saving two lines is not the reason. **The directory is never wrong, not even for an
    instant.** Done the class 3 way it exists as root's, mode `755`, until the next two commands
    land; do those in the wrong order, or forget one, and it stays that way. `install` creates it
    with the owner and the mode it is supposed to have. You will meet the same command again in
    Part 2, making a file that must never exist at the wrong permissions even briefly — a file
    with a password in it.*

    ***Owner and mode first, then unpack — and no `sudo` on the second and third commands.***
    *The directory was made yours before anything went into it, so everything that lands in it
    is yours too, and yours to `chmod` afterwards. Unpack it as `root` instead and every file
    belongs to `root`, and you will be typing `sudo` at your own application for the rest of the
    afternoon.*

    ***The `s` is there after unpacking and the `w` is not.*** *Compare the two `ls -l` outputs
    above: `drwxr-sr-x` became `drwxrwsr-x`, and nothing but the third command did that. setgid
    hands down the **group**, never the permission, and the modes inside an archive are whatever
    the person who built it had — so unpacking alone leaves these three directories closed to
    everyone but you. That is why there is a third command at all, and why it has to walk the
    tree rather than touch `/srv/school` alone.*

    ***And why `find -perm -u+w` rather than `chmod -R g+w`?*** *For this archive, as it
    happens, the blunt version would have done — but you cannot know that without opening every
    file in it. `-perm -u+w` states the rule instead of guessing: **the group may write wherever
    the owner may, and nowhere else.** `-R` grants it to everything, including a file whose owner
    deliberately made it read-only. From class 6 the two stop agreeing here as well, when this
    directory becomes a repository and git starts storing its objects read-only on purpose.*

    *`db/` is new, and it is the point of the first half of today: **the database a program
    needs is part of the program**, and it ships in the same archive as the code. Three
    scripts, and you will read all three before you run any of them.*

6. Have a **second window** open on your own computer — a browser, or a terminal on your
   laptop. Step 25 asks what somebody *else* sees, and that question cannot be answered
   from inside the machine.

7. **Install MySQL Workbench on your own computer** if you do not already have it from your
   database course. Step 10 uses it. If it will not install today, that step can be skipped
   — everything else works without it.

&nbsp;

#### Your port

The API you deploy today listens on a port that is **yours alone**:

> **3** followed by the **last three digits of your VM's name.**

So `lvm68042` uses **3042**, and `lvm68007` uses **3007**. Check yours now, and write it
down — it appears in four steps and the checker knows which one is yours:

```bash
$ hostname
lvm68136
```

*That machine uses port `3136`. Nobody else on the network has your number, which is why
you can each open a port today without colliding. Your noticeboard will keep port 3000.*

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

### Answering, and checking your machine

A step with a question is marked **→ `T<n>`**, which is the key to fill in `answers.yaml`.
Each answer goes inside a `|` block, and the indentation matters — the answer lines sit two
spaces further in than their key:

```yaml
answers:
  T1: |
    your answer here
```

Run the checker whenever you like, as often as you like:

```bash
$ int134 check lab04class

  PASS  A database server is installed
  FAIL  Your API answers from outside your VM
        hint: Step 25.
  ...

  19 of 36 checks passed
```

You will see how many checks passed, not a score. Two of them run **from my server, not
from yours** — they ask your API for an answer the way anybody else on the network would.
A check that passes on your machine and fails from mine is not a contradiction; step 25 is
about exactly that difference.

**`sudo` will ask for your password**, several times today. It is your own password, and
nothing appears on screen as you type it.

&nbsp;

#### Four observations you cannot get back

Most of today you can look at again afterwards. **Four things exist for a moment and then
the next step destroys them:**

- **Step 1** — what the database service's **active** state says *straight after
  installing*. Starting it yourself later gives the same word for a different reason.
- **Step 6** — the password the server generates for you. It is shown **once**, and the
  server itself cannot tell you again. It is not stored anywhere in readable form — which
  is why step 6 also puts it into a file before you do anything else.
- **Step 14** — the error Prisma gives you *before* you fix the URL. Which of the two it
  is depends on your own password, and it is gone the moment you encode it.
- **Step 16** — the error it gives you *after* you fix the URL. For about one of you in
  five that is a second, different error; for everybody else it is the same one again.

**Write each one down as you reach it.** Step 6's password goes in `db/school.env` on your
VM and **nowhere else** — not in `answers.yaml`, not in a chat message, not in your notes
app. No question on this sheet asks for it, or for any part of it, and none ever will.

---

### Part 1 - A database server is a server

**The misconception this part attacks:** that a database is something your application
contains. It is a **separate server**, with its own process, its own port, its own users
and its own idea of who may do what. Your application is one of its clients.

*The names you need. Everything else in this part you have already done, in classes 1, 2
and 3 — installing a package, reading a unit's two states, reading a listening port. Recall
those rather than looking them up, and look them up rather than being stuck.*

| Name | What it is |
| :--- | :--- |
| `mysql-server` | the **package** — the database server itself |
| `mysql` | the **service** that package installs |
| `sudo mysql` | connect as the server's administrator |
| `mysql -u <user> -p` | connect as somebody else, with a password |

1. Install the package. Then establish three things about what you have just installed:
   that the service is **enabled**, that it is **active**, and which **version** of MySQL it
   is. What does the active state say? **→ `T1`**

    *Compare that with class 3. The web server was installed and did **not** start itself;
    you had to. Two packages, two different decisions by two different packagers — which is
    exactly why "installed" and "running" are separate questions and you check both.*

    *The version is not idle curiosity. This course expects **MySQL 8**, which is what the
    distribution's own package gives you on Ubuntu 24.04, and the checker says so if it
    finds anything else. Knowing the version of what you have deployed is the first thing
    anyone asks you when it misbehaves.*

2. Find the database's port and look carefully at the **address** it is bound to.
   Which address is it? **→ `T2`**

    ```bash
    $ ss -tln
    State  Recv-Q Send-Q  Local Address:Port  Peer Address:Port
    LISTEN 0      151         <...>:3306          0.0.0.0:*
    LISTEN 0      70          <...>:33060         0.0.0.0:*
    LISTEN 0      511         0.0.0.0:80          0.0.0.0:*
    ```

    *Your web server is on `0.0.0.0` — every address on the machine. The database is not,
    and the difference is the whole of this step. Class 3 taught you to read this column;
    this is the first time it says something different about two services on one machine.*

3. Given that address, does the database need a firewall rule of its own so that your
   application can reach it? **→ `T3`**

    *Think before you answer, and say why to yourself. Your application runs on this same
    machine. Where does its connection to the database actually travel?*

    *A database on the public internet is one of the most common ways organisations lose
    everything at once. This one cannot be reached from outside, and you did not have to do
    anything to make that true — but you do have to know it, because in class 8 you will be
    the one deciding.*

4. Connect as the server's administrator, then try again as yourself. What does the second
   attempt say? **→ `T4`**

    ```bash
    $ sudo mysql -e "SELECT VERSION();"
    +-------------------------+
    | VERSION()               |
    +-------------------------+
    | 8.0.46-0ubuntu0.24.04.3 |
    +-------------------------+
    $ mysql -e "SELECT 1;"
    <...>
    ```

    *`sudo mysql` needs no password: the administrator account is tied to the operating
    system user rather than to a password, so being root on this machine is enough. That is
    a decision about trust, and it is why your application must not connect that way.*

&nbsp;


---

### Part 2 - A database, a user that owns only it, and the data it holds

**The misconception this part attacks:** that an application connects to "the database" as
an administrator. It should not, and the reason is not politeness. An application that can
only touch its own data cannot destroy anything else when it is wrong — or when somebody
else is driving it.

| Statement | What it does |
| :--- | :--- |
| `CREATE DATABASE <name> CHARACTER SET utf8mb4` | Make a database that can hold any character |
| `CREATE USER '<u>'@'localhost' IDENTIFIED BY RANDOM PASSWORD` | Make a user, and let the **server** choose the password |
| `GRANT ALL PRIVILEGES ON <db>.* TO '<u>'@'localhost'` | Let that user do anything **in that one database** |
| `SHOW GRANTS FOR '<u>'@'localhost'` | What may this user actually do? |
| `SHOW DATABASES` | Which databases can I see? |

5. **Read the three scripts before you run any of them.** They came with the application,
   in `db/`, and between them they build everything the database side of today needs.

    ```bash
    $ ls /srv/school/db
    schema.sql  seed.sql  setup.sql
    $ cat /srv/school/db/setup.sql
    ```

    | Script | What it makes | Run as |
    | :--- | :--- | :--- |
    | `setup.sql` | the database, the user, and its grant | the **administrator** |
    | `schema.sql` | the table | the **`school` user** |
    | `seed.sql` | the rows that start the register | the **`school` user** |

    *Only the first needs the administrator, and that is the shape of every deployment you
    will meet: one privileged step that creates an account, and then everything else done
    **as** that account. If your application's user cannot build its own table, it is not
    really the owner of its own data.*

    *Reading them first is the habit, not the ceremony. These are short and you can check
    them in half a minute — but the day arrives when the script is four hundred lines and
    came from somebody else, and the half-minute you did not spend then is the whole of the
    story.*

    ***Why scripts at all, when you could type the statements?*** *Because typing produces a
    deployment nobody can reproduce, including you, in six months. A script can be read
    before it runs, reviewed by somebody who is not you, kept in version control beside the
    code it belongs to, and run identically on the next machine. You will see the same
    argument again in class 8 and class 10, about bigger things.*

    *`utf8mb4` in `setup.sql` is the character set that can actually store every character,
    including Thai and emoji. The older `utf8` in MySQL cannot, and choosing it is a bug you
    discover months later when somebody's name will not save. This server's default is
    already `utf8mb4`, so the clause changes nothing today — it is written anyway, because
    the default lives in a file somebody can edit and the next machine may not be this one.
    **State what you depend on.***

6. Run the first of them as the server's administrator — and **let the server choose the
   password.** Then put that password straight into `db/school.env`, because you will not
   be shown it twice.

    ```bash
    $ sudo mysql < /srv/school/db/setup.sql
    user	host	generated password	auth_factor
    school	localhost	<twenty characters>	1

    $ install -m 600 /dev/null /srv/school/db/school.env
    $ nano /srv/school/db/school.env
    $ ls -l /srv/school/db/school.env
    -rw------- 1 sysadmin sysadmin 81 Aug 26 14:05 /srv/school/db/school.env
    ```

    Three lines go in it, and the third is the one that matters:

    ```
    SCHOOL_USER=school
    SCHOOL_DATABASE=school
    SCHOOL_PASSWORD='<the twenty characters, exactly as printed>'
    ```

    > ***Exactly as printed.*** *This file holds the password the way the **server** thinks
    > of it. Later today you will make a second, **encoded** copy for the application, and
    > that one belongs in `backend/.env` and nowhere else. Put the encoded form in here and
    > every `mysql` command you run afterwards answers `Access denied` — which sends people
    > off to inspect the GRANT, where nothing is wrong.*

    ***Mode 600 before there is anything in it.*** *The same `install` you met in setup step
    5, making a file this time rather than a directory: `/dev/null` is what it copies, so what
    arrives is an empty file at exactly the mode you asked for — in one command, with no moment
    in between. Do it the other way round and the file exists, with a password in it, at
    whatever permissions you happened to get. A password every account on the machine can read
    is not a password.*

    ***The single quotes are doing real work.*** *A generated password is twenty characters
    from a large alphabet and can easily contain `$`, `&` or `*`. In single quotes the shell
    hands them over untouched; in double quotes, or none, you get something else. A
    generated password can never contain a single quote itself, so this is always safe.*

    *No box drawn round `mysql`'s output this time. It prints an ASCII table when it is
    talking to a terminal and plain tab-separated columns when it is not, and here its input
    is a file. Same data, and the second form is the one you can pipe into something else.*

    *`RANDOM PASSWORD` is not a convenience. A password you invent for a service is one you
    will reuse, type into the wrong window, or make short enough to remember. This one is
    twenty characters, no human ever memorises it, and it lives in exactly one file with the
    permissions to match. That is what a service credential should look like.*

    *`'school'@'localhost'` is one user: the name **and** where it may connect from. The same
    name from another host would be a different user, and does not exist.*

    *You will see `FLUSH PRIVILEGES` after a `GRANT` in about half the tutorials on the
    internet, and it is not in this script. `GRANT` takes effect immediately. That command is
    only needed when somebody has edited the server's grant tables directly, which is not
    something you should ever be doing.*

    &nbsp;

    > **This password goes in that one file on your VM and nowhere else.** Not in
    > `answers.yaml` — nothing on this sheet asks for it. Not in a message to a friend. Not
    > in a file you will commit to git in class 6.

7. Ask the server what that user may do. There are two lines. What is the **scope** of the
   second one — what does it apply to? **→ `T7`**

    ```bash
    $ sudo mysql -e "SHOW GRANTS FOR 'school'@'localhost';"
    +------------------------------------------------------------+
    | Grants for school@localhost                                |
    +------------------------------------------------------------+
    | GRANT USAGE ON *.* TO `school`@`localhost`                 |
    | GRANT ALL PRIVILEGES ON <...> TO `school`@`localhost`      |
    +------------------------------------------------------------+
    ```

    *`USAGE ON *.*` looks alarming and is not: it means "may connect, and nothing else". It
    is how MySQL says the user exists. Every actual permission is on the second line.*

8. Now stop being the administrator. **Load the credential file into your shell** and
   connect as the application's own user. The server keeps its own accounts in a database
   called `mysql` — can you see it? **→ `T8`**

    ```bash
    $ set -a; . /srv/school/db/school.env; set +a
    $ MYSQL_PWD="$SCHOOL_PASSWORD" mysql -u "$SCHOOL_USER" -e "SHOW DATABASES;"
    +--------------------+
    | Database           |
    +--------------------+
    | information_schema |
    | performance_schema |
    | school             |
    +--------------------+
    ```

    *This is what the grant bought you. If this application is ever broken into, the damage
    stops at its own data — the attacker inherits exactly these privileges and no more.*

    ***What those first two lines actually do.*** *`.` (a dot, the same as `source`) runs the
    file in **this** shell rather than a new one, so the variables it sets survive the
    command. `set -a` marks everything defined while it is on for export, so they reach the
    programs you run afterwards, and `set +a` turns that off again. This is the same
    `KEY=value` file format as `.env`, and as `EnvironmentFile=` in a systemd unit, and as
    the environment section of a Compose file in class 8. **One syntax, read by four
    different things.***

    ***And the password never appears on a command line.*** *`MYSQL_PWD=<value> <command>` is
    a shell **prefix assignment**: it puts the variable into the environment of that one
    command and nowhere else — not into this shell, and not into the next thing you run. What
    you type is `"$SCHOOL_PASSWORD"`, so that is what your history file keeps. And `ps`, which
    shows every account on this machine the full command line of every process, has nothing to
    show, because the password was never on one.*

    ***You could type it instead.*** *`mysql -u school -p`, with nothing after the `-p`, asks
    at the keyboard, and that is perfectly correct. It is not what we do here because the
    password is twenty random characters and you are about to need it four times. It is in a
    file precisely so that you do not retype it.*

    > ***MySQL's own manual calls `MYSQL_PWD` insecure. Read why, then read your platform.***
    > *The warning is about systems where one account can read another's environment. On Linux
    > it cannot: `/proc/<pid>/environ` is mode `-r--------`, owner only, and a second
    > unprivileged account is simply refused. What you must **never** do is the form that looks
    > tidiest — `mysql -p<password>`, the password stuck to the flag — because a command line
    > really is readable by everyone through `ps`, and it goes into your history as well.
    > **Know which of your platform's guarantees you are leaning on**, and you can tell the
    > difference between a warning that applies to you and one that does not.*

9. Build the table and load the register — **as that same user**, because it owns this
   database and that is what owning it means.

    ```bash
    $ MYSQL_PWD="$SCHOOL_PASSWORD" mysql -u "$SCHOOL_USER" "$SCHOOL_DATABASE" \
        -e "source /srv/school/db/schema.sql"
    $ MYSQL_PWD="$SCHOOL_PASSWORD" mysql -u "$SCHOOL_USER" "$SCHOOL_DATABASE" \
        -e "source /srv/school/db/seed.sql"
    ```

    ***Two ways to run a script, and you have now used both.*** *At step 6 the **shell** fed
    the file in — `sudo mysql < setup.sql`, a redirection — and that still works here:
    `... mysql -u "$SCHOOL_USER" "$SCHOOL_DATABASE" < /srv/school/db/schema.sql` does the same
    job. `source` is the **client's own** command for it, and it depends on no shell at all:
    the same word works when you are sitting at a `mysql>` prompt with no shell in reach,
    which is where you will find yourself on somebody else's machine one day.*

    ***And when a script fails halfway, they do not say the same thing.*** *Redirection
    reports `ERROR 1146 (42S02) at line 2:`. `source` reports `ERROR 1146 (42S02) at line 2 in
    file: '/srv/school/db/seed.sql':` — the same error, **plus the one fact you actually
    want** when you have just run two scripts one after the other. Both stop at the first
    failing statement and both exit non-zero, so neither lets a half-loaded schema look like
    success. Try it: put a typo in a copy of one of these files and run it.*

    Then look at what you loaded. How many rows are on the register, and what is the `major`
    of student `68130500460`? **→ `T9`**

    ```bash
    $ MYSQL_PWD="$SCHOOL_PASSWORD" mysql -u "$SCHOOL_USER" "$SCHOOL_DATABASE" \
        -e "SELECT * FROM students;"
    ```

    *Neither script needed `sudo`, and neither needed the administrator. **That** is the
    grant from step 6 doing its job — not a restriction you worked around, a boundary you
    worked inside.*

    ***Two files, and not one.*** *`schema.sql` owns the **shape** of the data; `seed.sql`
    owns the **data**. A schema change and a data load are different operations with
    different risks, and you will meet deployments where one is allowed and the other is
    not. `seed.sql` begins with a `DELETE`, which is safe on a register nobody has used yet
    and would not be safe on one somebody had — knowing that **before** rather than after is
    the habit worth having.*

    *Nothing here is Prisma, and nothing here needed it. An application's database is made of
    SQL statements, and a tool that writes them for you is a convenience, not a requirement.
    You will meet the tool in Part 3, and it will be joining a database that already exists.*

10. Now connect to the same database from **MySQL Workbench on your own computer**, over
    SSH. Which host did you give as the **MySQL Hostname**? **→ `T10`**

    In Workbench, make a new connection with **Connection Method: Standard TCP/IP over
    SSH**, and fill in seven fields:

    | Field | Value |
    | :--- | :--- |
    | SSH Hostname | `<your-vm>.sit.kmutt.ac.th:22` |
    | SSH Username | `sysadmin` |
    | SSH Password | your VM password |
    | MySQL Hostname | `<...>` |
    | MySQL Server Port | `3306` |
    | Username | `school` |
    | Password | the generated password from step 6 — *Store in Vault* |

    Then **Test Connection**, open it, and look at the `students` table you built two steps
    ago — the rows are there, and this is the first time today you have seen your database
    from outside a terminal.

    *Two hostnames in one dialog, and they are not the same machine — that is what this step
    is for. Workbench logs into your VM over SSH first, and then, **from inside your VM**,
    opens a database connection. So the MySQL hostname is whatever the database looks like
    from your VM's point of view, which is step 2's answer arriving again from a different
    direction.*

    *This is also the answer to "but the database is not on the network, so how do I ever look
    at it?" You do not expose it. You reach it through a channel you already have. Every
    production database you will meet is reached like this.*

&nbsp;


---

### Part 3 - The application, its dependencies, and its schema

**The misconception this part attacks:** that deploying a program means copying it onto a
machine. A program arrives with a list of things it needs, a description of the tables it
expects, and no way to run until both have been dealt with.

| Command | What it does |
| :--- | :--- |
| `npm ci` | Install dependencies **exactly** as recorded |
| `npm install` | Install dependencies, and update the record |
| `npx prisma migrate dev` | Write a **new** migration from the schema — a developer's command |
| `npx prisma migrate diff` | Compare what the database **is** against what the code **expects** |
| `npx prisma generate` | Build the database client the code imports |

*Your database already exists — you built it in Part 2, out of SQL, with no tool's help.
So Prisma is the **client** here and not the author, and the two commands that matter are
the last two.*

11. Install Node.js 24 from the NodeSource repository — the same three moves as class 3:
    fetch the key, add the repository, install.

    ```bash
    $ curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
        | sudo gpg --dearmor -o /usr/share/keyrings/nodesource.gpg
    $ echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_24.x nodistro main" \
        | sudo tee /etc/apt/sources.list.d/nodesource.list
    $ sudo apt update && sudo apt install nodejs
    $ node --version ; npm --version
    v24.19.0
    11.17.0
    ```

    *The distribution's own `nodejs` is version 18, which stopped receiving security fixes
    in April 2025. Deploying an unsupported runtime is a decision, and this is the second
    time this course has made you make it deliberately.*

    ***Why 24 and not 22, or 26?*** *Node's even-numbered releases become long-term support
    lines, and each one is "active" for a year before dropping to security fixes only. Today
    24 is the active one; 22 went to security-only in October 2025 and ends in April 2027;
    26 came out in May and is not an LTS line until October. The rule is worth more than the
    numbers: for something you have to keep running, take the newest release that has
    finished being new.*

12. Install the application's dependencies — then find out what makes `npm ci` different
    from `npm install`. Delete `package-lock.json`, run `npm ci` again, and read the
    refusal. What does it require? **→ `T12`**

    ```bash
    $ cd /srv/school/backend
    $ npm ci
    added 105 packages in 6s
    npm warn allow-scripts 3 packages have install scripts not yet covered <...>

    $ cp package-lock.json /tmp/
    $ rm package-lock.json
    $ npm ci
    npm error code EUSAGE
    npm error
    npm error The `npm ci` command can only install with an existing <...> or
    npm error npm-shrinkwrap.json with lockfile version 2 or higher.

    $ cp /tmp/package-lock.json .
    $ npm ci
    ```

    *That warning is new in npm 11 and it is not an error — nothing failed. Some packages
    ask to run a script of their own at install time, and npm has stopped doing that
    silently. Prisma is one of them; you build its client yourself at step 18, so there is
    nothing here you need to approve. Read the warning anyway: a package that runs code on
    your machine merely because you installed it is worth being asked about.*

    *Taking the copy first is the habit, not a detail of this step. You are breaking
    something on purpose on a machine with no undo — and from class 6 there is a repository
    here that would have kept it for you, which is most of why you will want one.*

    *That file records the exact version of all 105 packages, including the ones your
    dependencies depend on. `npm install` may quietly pick newer ones; `npm ci` refuses to
    guess. On a deployment you want the version you tested, not the version that exists
    today — which is why the lockfile is committed and why this is the command to use.*

13. The application needs to know where its database is, how to log in, and which port to
    listen on. Create its configuration from the example beside it, and make sure nobody
    else on the machine can read it.

    ```bash
    $ cp .env.example .env
    $ chmod 600 .env
    $ nano .env
    $ ls -l .env
    -rw------- 1 sysadmin sysadmin 3965 Aug 26 14:20 .env
    ```

    Fill in four values. **Put the password in raw, exactly as it stands in
    `db/school.env`** — we will deal with it properly in two steps' time:

    ```
    DATABASE_URL="mysql://school:<the generated password>@127.0.0.1:3306/school"
    STUDENT_ID="<your 11-digit student number>"
    PORT=<your port — 3 and the last three digits of your VM's name>
    HOST=0.0.0.0
    ```

    &nbsp;

    > ***Not `${SCHOOL_PASSWORD}`.*** *You have the password in a file two directories away,
    > and writing `mysql://school:${SCHOOL_PASSWORD}@…` here is the obvious next thought.
    > **Do not.** Two different programs read this file and they do not agree about `${...}`:*
    >
    > | reads `.env` | expands `${VAR}`? |
    > | :--- | :--- |
    > | the Prisma CLI — every `npx prisma …` | **yes** |
    > | systemd, at `EnvironmentFile=` in Part 4 | **no** — it hands over all eighteen characters, exactly as typed |
    >
    > *So it works every way you are likely to test it this afternoon, and fails the one way
    > the application is actually run. A configuration file that behaves differently
    > depending on who opened it is the worst kind there is, and you would be debugging it at
    > step 19 with nothing on screen to suggest why.*
    >
    > *There is a second reason, and it would still stand even if systemd did expand:
    > **substitution cannot percent-encode.** `${SCHOOL_PASSWORD}` would put the password in
    > raw — which is exactly the problem the next three steps are about.*

    *`600` means the owner may read and write it and nobody else may do anything. A file
    with a password in it that everybody can read is not a secret. There is a `.gitignore`
    beside it naming this very file, for the same reason: from class 6 this directory
    becomes a repository, and a password committed to one is public for ever — even after
    you delete it.*

    *`chmod 600` **before** you edit, not after. In between, the file exists with the
    password in it and the permissions the copy gave it.*

    *`HOST` decides which addresses the application listens on, and the example file's
    default — `127.0.0.1`, this machine and nothing else — is the one you want to end up
    with. You are overriding it today because today there is nothing in front of the
    application: at step 25 you reach it from your own computer, which cannot be done
    through a loopback address. In class 5 nginx takes that job, the API goes back to
    `127.0.0.1`, and port 80 is the only way in — which is where a deployed application
    belongs. Overriding a safe default is a decision, not a step; it is worth knowing which
    ones you have open.*

14. Ask Prisma to set the database up, using the command every tutorial on the internet
    gives you.

    ```bash
    $ npx prisma migrate dev --name init
    Environment variables loaded from .env
    Prisma schema loaded from prisma/schema.prisma
    Datasource "db": MySQL database
    ```

    **It will not finish — and it will not fail the same way for everybody in the room.**
    Which failure you get depends on the password the server happened to generate for you.
    About one of you in five gets this:

    ```
    Error: <...>: The provided database string is invalid. <...> in database URL.
    Please refer to the documentation ... In some cases, certain characters must be
    escaped. Please check the string for any illegal characters.
    ```

    Most of the rest get something longer that mentions a **shadow database** — which is
    step 16's subject, and a different problem entirely. There is a rare third possibility
    — `Access denied`, with no complaint about the URL at all — and step 15 explains that
    one too. It is the nastiest of the three.

    **Which error code did yours stop on, and in one sentence, what was it refusing to
    do?** **→ `T14`**

    *If you got the first one: nothing about your database is wrong. Prisma never got as
    far as connecting — it could not read the address you gave it. The middle of that
    message depends on your own password, so your neighbour's will not say the same thing
    as yours: `invalid port number`, `empty host`, `empty database name`, whichever field
    your password ran into first. **The code is the same for all of them**, and it is the
    code the question asks for. The last sentence is the whole diagnosis, and it is the
    sentence everybody skips: "certain characters must be escaped".*

    *If you got either of the others: **your URL is not correct. It is lucky.** Do step 15
    anyway, and read it twice — it is the more important of the two things to take out of
    today, and it is the one you would otherwise not find out about until it bit you on a
    machine you cannot easily get back into.*

15. Here is why — and this step matters **most** to the four in five for whom it worked.
    `DATABASE_URL` is a **URL**, and a URL has a grammar:

    ```
    mysql://  USER  :  PASSWORD  @  HOST  :  PORT  /  DATABASE
    ```

    The `:` ends the user, the `@` ends the password, the `/` ends the address — and your
    generated password is twenty characters drawn from an alphabet that contains all three
    of them, and `%` besides. What each does when it lands in the middle of a password:

    | | |
    | :--- | :--- |
    | `/` | **ends the address.** Everything after it is read as the database name, the URL is broken, and you get the error printed at step 14. About **one generated password in five** contains one. |
    | `%` | **begins an escape already**, so the reader quietly decodes it and hands MySQL a *different password*. No parse error at all — just `Access denied`, which sends everybody off to inspect the GRANT. Rare, and much the worst to find. |
    | `@` `:` | **survive** — *this* reader splits at the **last** `@` and the **first** `:`, so the password comes back out whole. That is a property of one library, not a rule of URLs. |

    So most of you got away with it, and getting away with it is not the same as being
    right: the next thing that reads that URL is perfectly entitled to split at the first
    `@` instead, and then your password is one character long and your host is nonsense.

    The fix is **percent-encoding**: every awkward character is replaced by `%` and its
    number, so that it can appear in a field without ending it. **Do it whether or not
    yours failed.**

    Encode the example password `p@ss:w/rd` and read what comes out. What does the encoder
    print? **→ `T15`**

    ```bash
    $ python3 -c 'import sys,urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' 'p@ss:w/rd'
    <...>
    ```

    Now do the same with **your own** password — and take it from the file rather than from
    your notes, so that it is never on a command line at all:

    ```bash
    $ set -a; . /srv/school/db/school.env; set +a
    $ python3 -c 'import os,urllib.parse as u; print("mysql://%s:%s@127.0.0.1:3306/%s" % (
        os.environ["SCHOOL_USER"], u.quote(os.environ["SCHOOL_PASSWORD"], safe=""),
        os.environ["SCHOOL_DATABASE"]))'
    <...>
    $ nano .env
    ```

    That prints the whole finished line. Put it in `.env` as `DATABASE_URL="<that>"`.

    *The example above needed single quotes round `p@ss:w/rd` because it was typed at the
    shell; your own password never is. It goes from the file into Python's environment and
    out again, and the shell never looks at it — which is one entire class of mistake that
    cannot happen. **`db/school.env` still holds the raw password and must keep holding it;
    the encoded copy lives here in `.env` and nowhere else.***

    ***Encode it once.*** *Run the encoder on an already-encoded password and `%40` becomes
    `%2540`. You then have a wrong password and no error message that says so — just
    `Access denied`, which sends everybody looking at the GRANT instead.*

    *Nothing about this is Prisma, or Node, or MySQL. It is the URL grammar, and you will
    meet it again in every connection string, every callback URL and every API token you
    ever put in a query parameter.*

16. Run the same command again. Now the whole room gets the same thing: it reads the URL,
    it connects, it gets further — and refuses for a reason that has nothing to do with
    your password at all. Which error code this time? **→ `T16`**

    ```bash
    $ npx prisma migrate dev --name init
    Error: <...>
    Prisma Migrate could not create the shadow database. Please make sure the database
    user has permission to create databases.
    Original error: Error code: <...>
    User was denied access on the database `prisma_migrate_shadow_db_2700f6fc-...`
    ```

    *If that is the same code you wrote down at step 14, it is a real answer and not a
    mistake — it means your URL parsed the first time and you were already standing here.
    Write it down again.*

    *Nothing is broken, and **do not fix this by granting more privileges.***

    *`migrate dev` is a **developer's** command: it works out what changed in the schema and
    writes a new migration, and to do that safely it builds a scratch copy of your database
    first. Your application's user cannot create databases — because you scoped it in step 6,
    correctly. The failure is your least-privilege grant working exactly as intended.*

    ***And there is a second thing wrong with it, which the error cannot tell you.*** *That
    command exists to **write a schema**. You already have one: you built it in Part 2, from
    `schema.sql`, before this application was ever started. Even with every privilege in the
    server it would be the wrong command — you are not developing this schema, you are
    deploying against it. Give a tool more power to make an error go away and you have
    hidden a question you should have asked.*

17. So stop trying to make a schema you already have. **Ask the other question instead:
    does the database match what this code expects?** Prisma will answer it directly, and
    it answers with an exit code as well as with words. What did it print, and what would a
    non-zero exit have meant? **→ `T17`**

    ```bash
    $ npx prisma migrate diff \
        --from-schema-datasource prisma/schema.prisma \
        --to-schema-datamodel   prisma/schema.prisma \
        --exit-code
    <...>
    $ echo $?
    <...>
    ```

    *Read the two `--from`/`--to` options as a sentence: **from** what the datasource
    actually contains, **to** what the datamodel in `schema.prisma` describes. The answer is
    the work that would have to be done to the database to make the two agree — so no work
    means they already agree.*

    *`--exit-code` is what makes this more than a thing to look at. `0` for no difference,
    `2` for a difference, and a number is something a deployment script can act on at three
    in the morning when nobody is reading the output. **This is the command you run before
    you start an application, not after it has failed.***

    *You built that table by hand in Part 2, out of `schema.sql`, and Prisma has just
    confirmed that what you built is exactly what the code was written against. That is the
    whole of this flow: **the database is owned by the database scripts; the application is
    a client that checks its assumptions and then gets on with it.***

    *Try it against a database that has drifted and you get the difference itemised —
    `[*] Changed the students table`, `[+] Added column …`. Worth knowing what it looks
    like, because that is the output that tells you why an application that worked yesterday
    does not today.*

18. Last piece: build the client the application's code imports.

    ```bash
    $ npx prisma generate
    ✔ Generated Prisma Client (v6.19.3) to ./node_modules/@prisma/client in 63ms
    ```

    *`import { PrismaClient } from "@prisma/client"` in `server.js` imports code that does
    not exist until this command writes it — generated from `schema.prisma`, into
    `node_modules`, on this machine. It is not in the repository and it is not in the
    archive, which is why deploying an application is never only copying files.*

&nbsp;


---

### Part 4 - Run it as a service

**The misconception this part attacks:** none — you know this one. This is class 2's
`int134-heartbeat.service` again, except that this time the thing you are handing to
systemd is a real application with a database behind it. That is the point: the mechanism
does not grow with the program, and you write this unit the way you wrote that one.

19. Write `/etc/systemd/system/school-api.service`, and tell systemd to re-read its units.

    The three sections are class 2's, and so are `Description=`, `User=`, `ExecStart=`,
    `Restart=` and `WantedBy=`. Three directives are new:

    | Directive | Section | What it does |
    | :--- | :--- | :--- |
    | `After=` | `[Unit]` | Start this only once the units named here have started |
    | `WorkingDirectory=` | `[Service]` | The directory to run the program from |
    | `EnvironmentFile=` | `[Service]` | A file of `KEY=value` lines to hand the program |

    It must run the backend's `server.js` under `node`, from the `backend` directory, as
    `sysadmin`, taking its configuration from the file you wrote in step 13, restarting
    always, ordered after the network **and the database**, and installable into
    `multi-user.target`.

    Fill in every `<...>`. **The lines already written out are given to you** — copy them
    as they stand:

    ```ini
    [Unit]
    Description=<...>
    After=network-online.target <...>

    [Service]
    User=<...>
    WorkingDirectory=<...>
    EnvironmentFile=<...>
    ExecStart=/usr/bin/node <...>
    Restart=<...>
    RestartSec=5

    # The service reads its code and its configuration; it has no reason to write
    # anywhere on this machine, and saying so costs nothing.
    NoNewPrivileges=true
    PrivateTmp=true
    ProtectSystem=full
    ProtectHome=read-only

    [Install]
    WantedBy=<...>
    ```

    ```bash
    $ sudo systemctl daemon-reload
    ```

    *`WorkingDirectory=` is why `ExecStart=` can end in a bare filename — systemd runs the
    program from that directory. The interpreter still needs its absolute path. Class 2's
    rule has not moved: systemd expands no `~`, and has no idea what directory you were in.*

    *`EnvironmentFile=` is how the configuration you wrote in step 13 reaches the program —
    **systemd** reads it and hands it over as environment variables. The application's own
    code never opens that file and never mentions its name, which is why the same code runs
    unchanged in a container in class 8 with the same values supplied a completely different
    way. It names the **file**, not the directory holding it.*

    *(One honest complication, in case you meet it: if you run `node server.js` by hand from
    that directory, it works — because the Prisma library looks for a `.env` beside it as a
    convenience for developers. That is the library, not this application, and it is why the
    file is called `.env` rather than anything else. systemd is not relying on it.)*

    *`After=` orders startup. It does not wait for MySQL to be ready to **answer**, which is
    what `Restart=always` is really for.*

    *Leave `User=` out and the service runs as `root`. A web application reachable from the
    network is exactly the kind of program that should not, and the checker looks.*

    *`RestartSec=` is how long systemd waits before restarting. Without it a program that
    fails instantly is restarted as fast as the machine can manage, which turns one broken
    deployment into a busy machine.*

    *The four after the comment are **sandboxing**, and they are given to you because they
    are not class 4's subject — but they are what separates a service from a program you
    happened to start. `NoNewPrivileges=` stops it ever gaining privilege it did not start
    with; `PrivateTmp=` gives it its own `/tmp` so it cannot read anyone else's; and the
    two `Protect` lines make the operating system and the home directories read-only to it.
    None of them changes what your application does. All of them shrink what it can do to
    this machine if somebody else ever gets to decide what it runs — which is the whole
    reason the database user was scoped in Part 2, applied one layer up.*

    *`systemctl show school-api -p NoNewPrivileges` will tell you afterwards whether
    systemd read the line the way you meant it.*

    **There is no finished unit file on this machine to copy** — not in the archive, not
    under `/srv/school`. The skeleton above and the requirements are what you have, and
    that is deliberate: you write this one in class so that you can write the next one, on
    your noticeboard, on your own.

20. Enable and start it — **one command does both**. Then ask the two questions separately,
    the way class 2 taught you: is it enabled, and is it active?

    ```bash
    # enable it and start it in the one command
    Created symlink /etc/systemd/system/multi-user.target.wants/school-api.service → /etc/systemd/system/school-api.service.

    # then the two states, one after the other
    enabled
    active
    ```

    *`enabled` answers "will it come back after a reboot"; `active` answers "is it running
    now". Class 2 separated them for a reason and today is the payoff: the service you just
    wrote can be one without the other, and only one of those is a working deployment.*

21. Read the service's log — class 2's command, this unit's name, and the last few lines is
    enough. The application prints one line as it starts, saying where it is listening.
    **Check that the port is yours.**

    ```bash
    # the last few lines of this unit's log
    Aug 26 14:31:51 lvm68136 systemd[1]: Started school-api.service - <the description you wrote>.
    Aug 26 14:31:52 lvm68136 node[269799]: cors: disabled (CORS_ORIGIN is not set)
    Aug 26 14:31:52 lvm68136 node[269799]: school api listening on 0.0.0.0:3136
    ```

    *No `sudo`. You are in the `adm` group, which is what lets you read another service's
    journal at all — worth knowing the day you are on a machine where you are not.*

    *If it says `3100`, your `.env` has no `PORT` line and the application fell back to its
    own default. That default is deliberately nobody's correct answer: it starts, so what
    you get is a check that tells you which port it wanted rather than a service that will
    not run at all.*

    *The application writes to its standard output and systemd puts that in the journal —
    the same mechanism as your heartbeat script in class 2. It writes no log file of its
    own, deliberately: in class 6 the very same output appears in `docker logs`.*

22. Ask the API whether it is alive.

    ```bash
    $ curl -s http://127.0.0.1:<your port>/api/health
    {"ok":true,"student":"<your student number>","time":"2026-08-26T07:31:54.959Z"}
    ```

    *A health endpoint exists so that something other than a human can ask "is this
    working?". You will point a container at one in class 9.*

    *If `student` is empty, `STUDENT_ID` is missing from `.env`. Fix it, then
    `sudo systemctl restart school-api` — the file is read once, at start.*

23. Now use the API properly. Read the register, add yourself to it, then deliberately post
    one with a field missing. What status does the last one come back with? **→ `T23`**

    ```bash
    $ curl -s http://127.0.0.1:<your port>/api/students

    $ curl -s -X POST -H 'Content-Type: application/json' \
        -d '{"studentId":"<your student number>","firstName":"<your name>","lastName":"<your surname>","major":"IT"}' \
        http://127.0.0.1:<your port>/api/students

    $ curl -s -i -X POST -H 'Content-Type: application/json' \
        -d '{"studentId":"99999999999"}' \
        http://127.0.0.1:<your port>/api/students | head -1
    HTTP/1.1 <...>
    ```

    *This is how a deployment engineer meets an API: not by reading about REST, but by
    asking a running one for something and reading what it says back. `curl` never enforces
    anything a browser would — it is the honest view of what the server does.*

    *Send the **same** student twice and you get a third answer again. Try it, and try
    `curl -X DELETE http://127.0.0.1:<your port>/api/students/99999999999` as well. Four
    different situations, four different status codes, and none of them is the server
    breaking.*

24. **Restart** `school-api`, then ask the API for the register again. Are you still on it?
    **→ `T24`**

    ***This is the step the whole afternoon is built towards.*** *In class 3 the Add button
    could not work at all. Now it works, and what you added outlives the program that
    accepted it, because the program is not where it lives.*

25. Your API is listening on every address, but nobody outside can reach it yet — the same
    situation as class 3, `lab03class` step 13. Let **your** port through the firewall, read
    the rules back to check it took, and then try the address below from your own computer.
    Does it answer? **→ `T25`**

    ```bash
    # allow your own port in, then read the rules back
    Rule added
    ```

    ```
    http://<your-vm>.sit.kmutt.ac.th:<your port>/api/health
    ```

    *You have now opened two ports on this machine. In class 5 you will close this one
    again, on purpose, and the application will keep working at
    `http://<your-vm>.sit.kmutt.ac.th/school/` — which is the argument for the thing class
    5 is about.*

&nbsp;


---

### What is checked

**On your machine.**

| Part | Checked |
| :--- | :--- |
| Setup | `/srv/school` is yours, group `sysadmin`, setgid — and the group can write **inside** `backend`, `db` and `frontend`, which unpacking alone does not give it |
| 1 | MySQL **8** is installed, enabled and running; the database is **not** listening on a public address |
| 2 | `db/school.env` exists, nobody else can read it, and names the three variables; the password in it really is the `school` user's; and so is the encoded copy in `backend/.env` |
| 3 | Node 22 or newer; the application and its `node_modules`; `.env` exists and is not world-readable; the generated client is in place |
| 4 | the unit file says every one of the things step 19 asked for, and does **not** run as root; the service is enabled and active; something is listening on **your** port; the API answers and reports your student number; the API returns students that came out of the database |

**From my server.** Your API answers from outside, and your register is readable from
outside.

**From your answer file.** `T1`, `T2`, `T3`, `T4`, `T7`, `T8`, `T9`, `T10`, `T12`, `T14`,
`T15`, `T16`, `T17`, `T23`, `T24`, `T25`.

**Your database password is never transmitted, stored, or asked for**, and no question on
this sheet wants it — not the password, not any part of it, not which characters it
contains.

*Three checks open those files, on your own machine and nowhere else. Two of them read
`db/school.env` and `backend/.env`, log in to MySQL as `school`, and report the single line
the server sends back: `school@localhost` — which is how the checker can tell you a
credential is wrong **because the server refused it**, rather than leaving you to find out
when the service will not start. The third reads `db/school.env` for the **names** of the three variables you
set, and never their values. Neither password, nor any part of either, is printed, sent
anywhere, or written down; every other check `stat`s the files for their permissions and
does not open them.*

*One check in `lab04`, next week's sheet, opens `.env` for a different reason — to compare
this password with the noticeboard's and confirm you gave the two applications different
ones. That comparison also happens on your own machine and also reports one word.*

**No check reads your data.** The only statement any of them runs is `SELECT
CURRENT_USER()`, which asks the server who it thinks you are and touches no table. That
your register really is in the database is proved through the API instead: students come
back, so something stored them. A database nothing can query is not deployed.

**Nothing here will break in class 5.** That class rebinds the API to this machine only and
closes your port — so no check requires the public address, and the probes from my server
accept your API on your port **or** through the reverse proxy you are about to build.

---

### After class

`lab04` asks you to do all of this again on the **noticeboard**, and it carries the mark.
It gives you the tasks and not the commands: the recall is the point, and this sheet stays
where it is for you to come back to.

**One thing there is genuinely different, and it is not a trick.** Today your database
existed before the application did — you built it out of SQL from `db/schema.sql`, and
Prisma arrived afterwards as a client and checked that the two matched. The noticeboard is
the other way round: it carries a **migration**, and the migration is what creates its
table. So there is a third `prisma migrate` subcommand, you have not run it, and finding
out which one it is — and what it does and does not bring with it — is part of that lab.

*Both flows are real, and which one you meet is decided by where the application came from.
A schema somebody's database team owns, with an application deployed against it: today. An
application that carries its own schema into a database made for it: `lab04`. The mistake is
not knowing which of the two you are standing in — and that is what `P3005` and `P3014` are
each trying to tell you.*
