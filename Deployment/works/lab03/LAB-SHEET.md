# INT134 System Deployment
## Class 03 Deploy Static Web

### Lab Instructions

1. It is best to learn from experiment, read command help, and figure out the solution yourself.

2. Do not search for the answer on internet or use AI.

3. Do not ask or copy answers from your friend.

---

### Setup

1. Connect to `int134` vm with ssh.

2. Create a directory `~/int134/lab03/` under your home directory and change working directory to this directory.

3. Copy `/home/public/labs/lab03/answers.yaml` to `~/int134/lab03/answers.yaml`.

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
      T5: |
        your answer here
    ```

2. Test your work using `int134 check lab03`. Run it as often as you like.

    ```bash
    $ int134 check lab03

      PASS  nginx is installed
      FAIL  Your site answers from outside your VM
            hint: Class 3 step 14, and step 6 here. Reachable from another
                  machine, not just from your own.
      ...

      9 of 23 checks passed
    ```

    You will see how many checks passed, not a score.

3. A step with a question to answer is marked **→ `T<n>`**, which is the key to fill
   in `answers.yaml`. Steps without a mark still count — most of them are checked on
   your machine instead.

4. **Some of this lab's checks are run from my server, not from your VM.** They fetch
   your site the way anybody else would. A check that passes on your machine and fails
   from mine is not a contradiction — Part 3 is about exactly that difference.


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

**You need two windows in this lab.** One is an ssh session on your VM, as usual. The other
is your own computer — a browser, or a terminal on your laptop. The readiness check below
and steps 8 and 9 ask what someone *else* sees, and that question cannot be answered from
inside the machine.

&nbsp;


---

### Before you start - is your machine ready?

This lab continues from class 3. **If you did not finish `lab03class`, do that first** — it
is not marked, it has no deadline, and everything below assumes the machine that sheet
leaves you with.

If you were in class, this is a two-minute check and not a repeat. Four things have to be
true before step 1 will work.

| | Check it with | If it is not true |
| :--- | :--- | :--- |
| nginx is installed, and it is the build from the repository class 3 added rather than the distribution's | `nginx -v`, `apt-cache policy nginx` | `lab03class`, part 1 |
| It starts at boot **and** it is running now | `systemctl is-enabled nginx`, `systemctl is-active nginx` | `lab03class`, part 2 |
| Something is listening on port 80 | `ss -tln` | `lab03class`, part 2 |
| A visitor can reach it — load it from **your own computer**, not from the VM | a browser, or `curl` on your laptop | `sudo ufw allow 80/tcp`, and `lab03class` part 3 for why |

**`int134 check lab03` answers all four for you.** Run it before you start: six of its
machine checks and one probe from my server are exactly this list, and they are already
passing if you are ready. They are checked again at the end, because a deployment that is
not reachable is not deployed — so nothing here is thrown away, and none of it is asked
twice.

*Class 3 is where this was built and explained. This lab does not rebuild it.*

&nbsp;


---

### The lab - Serving your own site

*This is class 3's part 4, and it is the whole of this sheet. Its steps are numbered from
1, because there is nothing before them here.*

**The misconception this part attacks:** that a web server serves *your* files. It serves
the files it has been configured to serve, from a directory it has been told about, and by
default that is neither yours nor anywhere near your home directory.

You are deploying an application you did not write. That is deliberate, and it is the
normal situation: the person who deploys software is usually not the person who wrote it.
You are not expected to read the JavaScript, and nothing in this lab asks you to.

You have already written a server block and served a page of your own from it, in class 3.
This does the same thing for a real application — and then makes one machine serve two sites
at once, each answering to its own name, with one of them answering for everything else as
well.

| Command | What it does |
| :--- | :--- |
| `tar -tzf <file>` | **List** what is in an archive, unpacking nothing |
| `tar -xzf <file> -C <dir>` | Unpack an archive into a directory you name |
| `--strip-components=1` | …without the archive's own top-level folder |
| `chmod 2775 <dir>` | Group-writable, and **setgid** — new files inherit the group |
| `find <dir> -perm -u+w -exec chmod g+w {} +` | Add group-write wherever the **owner** can already write |
| `access_log` / `error_log` | Where this site records requests, and where it records faults. Under `/var/log/nginx/`, ending `.log` |
| `rsync -a --chmod=D755,F644 --delete <src>/ <dst>/` | Make `<dst>` match `<src>`, at the modes you name |
| `/etc/nginx/conf.d/*.conf` | Server blocks. **Only `.conf` is read** |
| `sudo mv <file> <file>.disabled` | Take a config file out of service without deleting it |
| `root` / `index` | Which directory to serve, and the default file |
| `curl -H 'Host: <name>' <url>` | Ask as though you had typed that name |
| `sudo nginx -t` | Check the configuration **without** applying it |
| `sudo systemctl reload nginx` | Re-read the configuration, without dropping connections |
| `sudo systemctl restart nginx` | Stop and start it instead |

1. The application is already on your VM: `/home/public/labs/lab03/noticeboard.tar.gz`. Make
    a home for it — the directory `/srv/noticeboard`, **owned by you**, group `sysadmin`, mode
    **2775** — unpack the archive into it, and then make sure the group can write
    **wherever you can**, throughout, and not just to the directory itself.

    ***You need `sudo` to create it, and then it must stop being root's.*** *A directory made
    with `sudo` belongs to `root`, and nothing you run as yourself may write inside it: `tar`
    prints `Cannot open: Permission denied` for every file in the archive and leaves you with
    an empty directory. Set the owner as well as the group, and unpack **without** `sudo`, so
    that every file of the deployment is yours to edit afterwards.*

    **You have not used `tar` before, so read this part before you type anything.** An
    *archive* is one file holding many. `.tar` is the bundle, `.gz` is the compression, and
    `.tar.gz` is both at once — one command deals with the pair:

    | Option | What it does |
    | :--- | :--- |
    | `-x` | e**x**tract. `-c` would **c**reate one instead |
    | `-t` | lis**t** what is inside, without unpacking anything |
    | `-z` | the archive is gzip-compressed — the `.gz` half of `.tar.gz` |
    | `-f <file>` | read this **f**ile. Put it last of the letters: the filename comes straight after it |
    | `-C <dir>` | **c**hange into this directory first, so the files land there and not wherever you happen to be standing |
    | `-v` | print each file as it goes |
    | `--strip-components=1` | drop the archive's own top-level folder as it unpacks |

    And two options of `find`, for the permissions afterwards:

    | Option | What it does |
    | :--- | :--- |
    | `-perm -u+w` | only entries whose **owner** may write. The leading `-` means "at least these bits", not "exactly" |
    | `-exec <cmd> {} +` | run a command on what was found. `{}` is the list, and `+` hands it over in as few runs as possible |

    ***Look before you unpack.*** *An archive can put its files anywhere it likes, including
    straight into your current directory, and there is no undo. `-t` costs you a second:*

    ```bash
    $ tar -tzf /home/public/labs/lab03/noticeboard.tar.gz | head -4
    <...>/
    <...>/README.md
    <...>/backend/
    <...>/frontend/
    ```

    Everything sits under **one top-level folder**. Unpack that as it stands into
    `/srv/noticeboard` and you get `/srv/noticeboard/<...>/backend`, a folder deeper than you
    want — which is what `--strip-components=1` is for: it throws away the first path segment
    of every entry as it writes them.

    ```bash
    $ ls -ld /srv/noticeboard
    drwxrwsr-x 2 sysadmin sysadmin 4096 Aug 20 14:22 /srv/noticeboard
    $ tar -xzf <the archive> -C <where it goes> --strip-components=1
    $ ls -l /srv/noticeboard
    total 12
    drwxr-sr-x 3 sysadmin sysadmin 4096 Aug 16 22:26 backend
    drwxr-sr-x 3 sysadmin sysadmin 4096 Aug 16 22:16 frontend
    -rw-r--r-- 1 sysadmin sysadmin 1556 Aug 19 23:22 README.md
    $ find /srv/noticeboard -perm -u+w -exec chmod g+w {} +
    $ ls -l /srv/noticeboard
    total 12
    drwxrwsr-x 3 sysadmin sysadmin 4096 Aug 16 22:26 backend
    drwxrwsr-x 3 sysadmin sysadmin 4096 Aug 16 22:16 frontend
    -rw-rw-r-- 1 sysadmin sysadmin 1556 Aug 19 23:22 README.md
    ```

    ***Owner and mode first, then unpack — that is why `ls -ld` comes before `tar` and not
    after.*** *And no `sudo` on the `find`: everything you just unpacked is yours, because
    the directory was yours before the archive went into it.*

    ***`2775`, and the `2` is the part that matters.*** *It is the setgid bit: every file
    created inside inherits the directory's group instead of the creator's own. That is how
    more than one person works on one deployment — they share a group, and nobody has to be
    inside anybody's home directory.*

    ***Look at what `tar` actually produced, though: `drwxr-sr-x`.*** *The `s` came down from
    the parent, so the group is right — but there is no `w` in it. **setgid hands down the
    group, never the permission**, and the modes inside an archive are whatever the person
    who built it had. So a colleague in your group could walk into `frontend/` and still not
    create a single file there. The `find` is what finishes the job the `2` started, and
    walking the tree is why it reaches inside.*

    ***Why `find` and not `chmod -R g+w`?*** *Because `-R` grants it to **everything**,
    including a file whose owner deliberately made it read-only. The rule you want is
    narrower — **the group may write wherever the owner may, and nowhere else** — and
    `-perm -u+w` is that rule written down. Tonight the two happen to agree, since every
    file in the archive is one you can write. From class 6 they stop agreeing: this
    directory becomes a repository, and git stores its objects read-only on purpose.*

    ***A deployment does not belong in `/home/you/`.*** *Look at your own home with
    `ls -ld ~`: it is `drwxr-x---`, so nobody else can even enter it. A service run from
    inside it would have one person's name written into its unit file, and would break the
    day that account went away. `/srv` is the system's own answer — the standard describes it
    as "site-specific data served by this machine", which is exactly what this is.*

    *`backend/` is next week's; leave it alone. From class 6 this directory becomes a
    repository of your own, and by class 10 it is what deploys itself — so whatever you put
    in here from now on, you are going to keep.*

2. Make the directory the site will be served from, `/var/www/noticeboard`, and deploy
    the frontend into it — at the permissions a published directory should have, rather
    than whichever ones the source happens to carry:

    ```bash
    $ sudo rsync -a --chmod=D755,F644 --delete --exclude config.js \
        /srv/noticeboard/frontend/ /var/www/noticeboard/
    $ ls -l /var/www/noticeboard
    total 24
    -rw-r--r-- 1 sysadmin sysadmin 3284 Aug 16 22:16 app.js
    -rw-r--r-- 1 sysadmin sysadmin  726 Aug 16 22:15 config.example.js
    drwxr-xr-x 2 sysadmin sysadmin 4096 Aug 16 22:16 data
    -rw-r--r-- 1 sysadmin sysadmin 1365 Aug 16 22:15 index.html
    -rw-r--r-- 1 sysadmin sysadmin 1990 Aug 16 22:15 store.js
    -rw-r--r-- 1 sysadmin sysadmin 2059 Aug 16 22:16 style.css
    ```

    ***`ls -l`, not `ls`, and compare it with the listing in step 1.*** *There is **no `w` in
    the group column** here — `-rw-r--r--` and `drwxr-xr-x`, where the source directory you
    just built has `-rw-rw-r--` and `drwxrwsr-x`. Same files, two directories, two different
    answers, and the difference is on the screen rather than in a paragraph.*

    ***Two directories, and the difference between them is the point.***
    *`/srv/noticeboard` is your **source directory** — everything the application arrived
    with, `backend/` and `README.md` included. `/var/www/noticeboard` is what the world is
    handed. **Never point a web server at your source directory:** it holds files a visitor
    has no business reading, and a web server hands out whatever is under its root without
    asking what it is. From class 6 there is a `.git` in here as well, and `/.git/config` is
    one of the most-requested paths on the internet — but the rule is already true tonight,
    before there is any history to give away.*

    *`rsync` rather than `cp`, because you will run this again every time you change the
    site. `-a` preserves permissions; the trailing slash on `frontend/` means its
    **contents**, `data/` included, rather than the directory itself; `--delete` removes
    anything from the document root that you have removed from the source, which is what
    makes it a **sync** and not a pile; and `--exclude config.js` protects the one file that
    the application did not arrive with — the next step creates it.*

    ***`--chmod=D755,F644` is the other half of the `find` you ran in step 1, and it points
    the opposite way.*** *`-a` preserves permissions — which means that **without this flag,
    the modes of your source directory become the modes of what the world is handed.** You
    just made the source group-writable so that a team can work on it. The copy must not be:
    it is published, and a document root should be readable by the web server and writable by
    nobody it could be. `D755,F644` says directories and files plainly, and it is on the
    deploy line rather than in a `chmod` afterwards so that **every future deploy reasserts
    it** — including the one GitHub Actions runs for you in class 10, where there is nobody
    to remember a second command.*

    *Two directories, two rules, and each follows from what the directory is **for**: the
    source is opened up because people work on it, the copy is closed down because it is
    given away.*

    *Type it once now and you will type it again in classes 5 and 9. In class 10, GitHub
    Actions runs this line for you on every push. That is most of what a deploy job is.*

3. The application does not know whose deployment it is. In the document root, make a
    `config.js` from the `config.example.js` beside it, and put your own 11-digit student
    number in `studentId`.

    ```bash
    $ grep studentId /var/www/noticeboard/config.js
      studentId: "<...>",
    ```

    *`config.js` did not come with the application, on purpose: it is different on every
    machine, which is what configuration means. `config.example.js` ships beside it so you
    know what to write. You will meet this pattern again in class 4, with a database password in it,
    and in class 8 it becomes an environment variable.*

    *Leave `noticesUrl` exactly as it is. It changes in class 5, and not before.*

4. Write the server block that serves it, as `/etc/nginx/conf.d/noticeboard.conf`. This
    is the shape. You supply the values.

    ```nginx
    server {
        listen      <...>;
        server_name <...>;

        access_log  <...>;
        error_log   <...>;

        root  <...>;
        index <...>;

        location / { try_files $uri $uri/ =404; }
    }
    ```

    ***You are not writing this from nothing.*** *`/etc/nginx/conf.d/` already holds a
    working server block that came with the package. Open it, read it, and use it as your
    model — adapting somebody else's configuration is most of what this job actually is,
    and it is what you will be doing in the exam.*

    - *`root` is the directory it serves; `index` is what to send when somebody asks for a
      directory rather than a file.*
    - *`server_name` decides which `Host` values this block **claims**, and step 5 is the
      specification: your VM answers to more than one name, and this block must claim the
      ones that are yours. Read the table before you fill this in.*
    - *`try_files` says: the file if it exists, then the directory index, and otherwise say
      plainly that there is nothing there.*

    ***`access_log` and `error_log` give this site a record of its own.*** *Look in
    `/etc/nginx/nginx.conf` and you will find both already set, near the top and inside
    `http` — one pair of files that **every** site on the machine writes to together. Naming
    them again inside your `server` block takes them over for your site alone, which is what
    you want the first time two sites disagree about what happened.*

    - ***Name them `noticeboard.access.log` and `noticeboard.error.log`*** — *the site first,
      then what the file is for, so a machine hosting a dozen sites lists them in pairs. You
      are not inventing that: the block that came with the package names its own log on
      exactly that pattern. Its line is commented out — the `#` at the start — so it is a
      model to copy, not a setting that is in force. `error_log` is not in that file at all;
      that one you can only take from `nginx.conf`.*
    - ***Directly in `/var/log/nginx/`, and ending in `.log`.*** *Not a tidiness rule.
      `/etc/logrotate.d/nginx` is set to rotate `/var/log/nginx/*.log` — that pattern does not
      look inside subdirectories, and it does not match a file called anything else. **A log
      nothing rotates grows until it fills the disk**, and a full disk takes down every service
      on the machine, not just this one.*
    - ***They do not take the same second argument.*** *`access_log` takes a **format** —
      `main` is defined in `nginx.conf`, go and read it. `error_log` takes a **level**, like
      `warn` or `notice`: how bad a thing has to be before it is written down. Swapping them
      is the usual first mistake, and `nginx -t` will tell you so.*

5. Look at what else is in that directory. **Every file ending in `.conf` is being read**,
    and two of them already claim port 80: the example that came with the package, and the
    class site you built in class 3. Which one came with the package? **→ `T5`**

    ```bash
    $ ls /etc/nginx/conf.d/
    <...>  noticeboard.conf  site.conf
    ```

    Your machine now has to serve two sites and still answer for everything else, and this is
    the end state it must reach:

    | A visitor sends `Host:` | The block that must answer |
    | :--- | :--- |
    | `<your VM>.sit.kmutt.ac.th` | your `noticeboard.conf` |
    | `<your VM>` | your `noticeboard.conf` — **the same block** |
    | `class.int134` | your class 3 `site.conf` |
    | **any other name at all** | your `noticeboard.conf` |

    The example that came with the package is not in that table, so **take it out of service**:
    rename it so that it no longer ends in `.conf`, and nginx stops reading it. **Rename it —
    do not delete it.** It is the worked example you wrote your own block from, it belongs to
    the package rather than to you, and you will want to read it again.

    Nothing you have written is in effect until nginx re-reads it, and that is step 6. Do that
    first, then come back here and check every row. `curl` will send any `Host` you tell it to,
    which is how you test a name without owning it:

    ```bash
    $ curl -s -H 'Host: class.int134' http://127.0.0.1/ | grep -i '<h1>'
    <h1>INT134 class site — <...></h1>
    $ curl -s -H 'Host: nobody.claims.this' http://127.0.0.1/ | grep -i '<h1>'
    <...>
    ```

    ***Two rows point at one block, and that is the hint.*** *One block can claim more than one
    name. Write both of them out — do not reach for a wildcard, because `*.sit.kmutt.ac.th`
    would claim your classmates' machines as well as yours. `nginx -t` tells you at once if you
    have written it in a form nginx does not accept.*

    ***The last row is the work.*** *A name that no block claims goes to the **default server**
    for that port, and class 3 showed you two different ways for a block to be it. Either will
    do. What will not do is two blocks claiming it at once — nginx calls that an error and
    refuses to load, so something has to give way first.*

    ***This does not undo what you did in class.*** *`site.conf` took the default because it was
    the only site on the machine. It is not any more. Handing the default to your real
    deployment is the ordinary next step, not a correction.*

    ***Row 3 still works, and it is worth understanding why.*** *`class.int134` reaches the block
    that claims it **by name**, even though another block is now the default. Matching happens
    first; the default is only the fallback.*

    ***The checker tests the last row with a name invented while it runs***, *different every
    time, so there is nothing to add to `server_name`. Make your block the default and it passes
    for every name at once — which is the whole point of having a default.*

6. Check the configuration, then make nginx re-read it without dropping connections.

    ```bash
    $ <...>
    nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
    nginx: configuration file /etc/nginx/nginx.conf test is successful
    $ <...>
    ```

    *`nginx -t` reads the configuration and tells you whether it would load, **without**
    touching the running server. Get into the habit of running it before every reload:
    a reload with a broken file leaves the old configuration running, but a **restart**
    with a broken file leaves you with no web server at all.*

    ***A reload is not instant.*** *The old worker processes finish what they are doing
    before the new ones take over. Measured on these VMs, a request sent immediately after
    a reload gets the OLD configuration about half the time. If the page looks unchanged,
    wait a second and ask again before you start debugging.*

    **Now go back to step 5 and check all four rows of its table.** They are what you have
    just applied, and this is the first moment they can be true.

7. Now break it on purpose, so that you recognise it later. Open your server block,
    delete the semicolon at the end of the `index` line, save, and test. Which word does
    nginx print in square brackets? **→ `T7`**

    ```bash
    nginx: [<...>] directive "index" is not terminated by ";" in /etc/nginx/conf.d/noticeboard.conf:<line>
    nginx: configuration file /etc/nginx/nginx.conf test failed
    ```

    *It names the file and the line — your line number will be whatever it is in the block
    you wrote. Most nginx configuration errors are this specific, and almost all of them are
    a missing semicolon or a missing brace.*

    *Compare it with a different failure: if you point `root` at a directory that does not
    exist, `nginx -t` is perfectly happy — the file is valid — and the site answers `404`
    instead. A configuration that **loads** and a configuration that **works** are two
    different tests, and you have now seen both.*

8. Put the semicolon back, test, reload, and open your site from your own computer again.
    What does the page show after the words `deployed by`? **→ `T8`**

    ```
    INT134 Noticeboard
    deployed by <...>
    ```

    *If it still says `(not configured)`, the browser is showing you a cached copy or
    `config.js` is not where the page expects it. `curl http://<your-vm>.sit.kmutt.ac.th/config.js`
    from your laptop settles which.*

    Now look at what your own site wrote down about that visit:

    ```bash
    $ tail -3 /var/log/nginx/<your access log>
    10.x.x.x - - [<...>] "GET / HTTP/1.1" 200 1365 "-" "Mozilla/5.0 <...>" "-"
    ```

    ***No `sudo`, and that is worth a moment.*** *Run `ls -l /var/log/nginx/` and look at
    the file you just caused to exist: `-rw-r--r--`, owner `root`. Anybody on the machine
    may read it and only `root` may write it. **Reading the evidence and changing the
    system are different privileges**, and a well-set-up machine hands out the first far
    more freely than the second.*

    ***Owned by `root`, when the workers run as somebody else?*** *It is the **master** that
    opens the log files — the one privileged process from class 3 — and the workers only
    write down descriptors it opened for them. Look again in a day or two, though:
    `logrotate` runs nightly, and the line `create 640 nginx adm` in its configuration
    says what the replacement file looks like. Yours will come back `-rw-r----- nginx
    adm`, and you will still read it without `sudo` — through the `adm` group, which your
    account is already in and which exists for exactly this.*

    *Every field there comes from the `main` format in `nginx.conf`: who asked, when, what
    they asked for, **what you answered** (`200`), and how many bytes you sent. This is the
    file you will open first, for the rest of your career, when somebody says "the site is
    broken" — because it tells you whether their request ever arrived at all.*

    *If yours is empty, nginx never reloaded, or you are reading the shared log instead of
    your own.*

9. The page has a form. Fill it in and press **Add notice**. What status does the page
    report back? **→ `T9`**

    ```
    <...> — this deployment serves files and cannot accept new notices.
    Storing data needs something more than a web server.
    ```

    ***This is the step the whole lab is built towards.*** *Nothing is broken. You asked a
    file server to store something, and it told you, correctly, that it does not do that.
    A web server hands out files that already exist; it has nowhere to put a new one and no
    idea what it would mean to try.*

    *That is what class 4 is: the program that accepts the notice, and the database that
    keeps it. Your site is finished. Your application is not.*

    *Look at your access log once more before you go. The attempt you just made is in it,
    with the status the server gave it — the same one the page reported to you. **A refusal
    is not an outage**, and telling the two apart from the log alone is most of what
    on-call work is.*

&nbsp;


---

### What is checked

`int134 check lab03` looks at three things: the state of your machine, **your site as seen
from my server**, and your answers.

**On your machine.** These need the work actually done, not described:

| | Checked |
| :--- | :--- |
| Readiness | nginx is installed, and is the build from the repository class 3 added rather than the distribution's; it is enabled; it is active; its workers run as something other than root; something is listening on port 80 |
| Step 1 | the application is unpacked into `/srv/noticeboard`, one directory level deep and not two; it belongs to you, group and owner both; and the group can write wherever you can, the `2775` and the `find` together |
| Step 2 | what you serve is a **copy** and not the source directory; and the files you deployed into it are not group-writable |
| Steps 3 to 5 | your server block names a port, a document root, an index, and an access log and error log of its own — under `/var/log/nginx/` so that they rotate — that nginx has actually opened; it claims both of your VM's own names and is the block that answers a name nobody claims, while your class 3 site still answers to its own; the example that came with the package is out of service and still on the machine; the noticeboard's files are all in that root; `config.js` carries an 11-digit student number and the web server can read it |

**The readiness checks are the same six `lab03class` runs, and they count here too.** They
are not a separate exercise — they are the machine class 3 built, still working. Doing this
lab without them is not possible, and doing them a second time is not asked of you.

**From my server, over the network.** These are the ones you cannot satisfy from inside your
own VM: your site answers on port 80, `config.js` identifies the deployment as yours, and
the notices file is being served.

**From your answer file.** `T5`, `T7`, `T8`, `T9` — four questions, all of them about work
in this sheet. The questions about class 3 were asked in class 3, on the `lab03class` sheet,
and are not asked again here.

**Nothing checks the value of `noticesUrl`, deliberately.** Class 5 changes it, and a check
on it would fail you for doing that class correctly.

**The firewall is not checked directly, and does not need to be.** `sudo ufw status` needs
privileges the checker does not have — but it does not need them, because the probe from my
server tests the same thing better. If your machine says port 80 is listening and my server
cannot reach it, the firewall is the only thing left. That pairing is the diagnosis, and it
is why those two checks exist as a pair.

Step 7 is not checked on the machine either, for a better reason: its end state is identical
to having done nothing. A semicolon you put back leaves no trace. What you saw happen is
evidence only you have, which is exactly why that step is a question.

&nbsp;


---

### Without the sheet

This is the same lab with the steps taken away — the deployment stated as six outcomes.
If you can work through this list without looking back at the steps, you can do this job.

- nginx is installed, and it is the build from the repository class 3 added rather than the
  one Ubuntu ships.
- It starts at boot, and it is running now.
- Port 80 is open to the outside, and nothing else has been opened that was not open
  before.
- The application is unpacked at `/srv/noticeboard`, it belongs to you rather than to
  `root`, and anyone in your group can write wherever you can.
- `/var/www/noticeboard` holds the site, it is a copy rather than the source directory,
  nothing you deployed into it is group-writable, and a server block you wrote serves it — with an access
  log and an error log of its own, where logs go and rotate — to a visitor who asks for
  your VM by either of its own names, or by any name nobody
  else has claimed, while the class site still answers to its own and the block that came
  with the package is out of service without having been deleted.
- Somebody at another machine can load the page and see your student number on it.

Nothing here is new and nothing here is extra. It is worth ten minutes at the end, because
it is how the lab exam will be written: an outcome, a machine, and no list of commands.
