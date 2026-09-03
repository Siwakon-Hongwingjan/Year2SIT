# INT134 System Deployment
## Class 03 Deploy Static Web — During Class

### What this session is

We do this one **during class**. I will explain the materials and the tasks; you run
it on your own VM as we go. Ask questions at any point — that is what the afternoon is for.

There is a second sheet, `lab03`, which you do **on your own after class**. It carries the
mark. This sheet does not: it exists so that the work you do in this room is recorded, and
your participation credit comes from it.

---

### Setup

1. Connect to your `int134` VM with ssh.

2. Create a directory `~/int134/lab03class/` under your home directory and change working
   directory to it.

3. Copy `/home/public/labs/lab03class/answers.yaml` to `~/int134/lab03class/answers.yaml`.

4. Modify `answers.yaml`: set your student ID and your full name.

5. Have a **second window** open on your own computer — a browser, or a terminal on your
   laptop. Steps 13, 14 and 18 onwards ask what somebody *else* sees, and that question
   cannot be answered from inside the machine.

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

A step with a question is marked **→ `T<n>`**, which is the key to fill in `answers.yaml`. Each
answer goes inside a `|` block, and the indentation matters — the answer lines sit two spaces
further in than their key:

```yaml
answers:
  T6: |
    your answer here
```

Run the checker whenever you like, as often as you like:

```bash
$ int134 check lab03class

  PASS  nginx is installed
  FAIL  Your web server answers from outside your VM
        hint: Step 14. Reachable from another machine, not just from your own.
  ...

  9 of 19 checks passed
```

You will see how many checks passed, not a score. Two of them run **from my server, not from
yours** — they fetch your site the way anybody else on the network would. A check that passes on
your machine and fails from mine is not a contradiction. Parts 3 and 4 are about exactly that
difference.

**`sudo` will ask for your password**, several times today. It is your own password, and
nothing appears on screen as you type it.

&nbsp;

#### Four answers you cannot get back

Most of what we do today you can look at again afterwards — nginx will still be installed, still
running, still listening. **Four observations are not like that.** They exist for a moment and
then the next step destroys them, and your machine will have no way to show you again:

- **Step 6** — what `systemctl is-enabled nginx` prints *before we start anything*.
- **Step 7** — what `systemctl is-active nginx` prints *before we start anything*.
- **Step 13** — what happens when you load your page from your own computer, *before* we touch
  the firewall.
- **Step 18** — which page a visitor gets *before* you change which block answers.

**Write each one into `answers.yaml` as you reach it**, not afterwards. This is not a trick — it
is the honest situation, and it is why I am telling you now rather than at the end. Nothing
asks you for them a second time — this sheet is the only place they are collected, which is
why missing one means it is gone.

&nbsp;

#### How to read this sheet

Because we are doing this together, the **commands are all here** — you do not have to work
them out. What is hidden is the part you have to *read off your own screen*:

```bash
$ systemctl is-active nginx
<...>
```

`<...>` means *look at your terminal*. Your machine's answer is the one that matters.

&nbsp;


---

### Part 1 - Where your software comes from

**The misconception this part attacks:** that `apt install nginx` installs *nginx*. It
installs **whichever nginx the machine has been told about**, and there is more than one.
The build Ubuntu ships and the build nginx.org ships have different version numbers,
different default configuration, and different file layouts — and every instruction you
find on the internet silently assumes one of them.

We use the one from **nginx.org**, for a reason that arrives in class 6: it is the same
build, and the same layout, as the official container image. Learn one layout, not two.

> The installation steps are taken from https://nginx.org/en/linux_packages.html#Ubuntu.  

| Command | What it does |
| :--- | :--- |
| `apt-cache policy <pkg>` | Which versions are available, and **from where** |
| `gpg --dearmor` | Convert a text key into the binary form apt wants |
| `/usr/share/keyrings/` | Where a repository's signing key belongs |
| `/etc/apt/sources.list.d/*.list` | One file per extra repository |
| `apt update` | Re-read every repository's list of packages |
| `dpkg-query -W <pkg>` | What is installed, and which version |

1. Before changing anything, ask apt what it currently offers for `nginx`.

    ```bash
    $ apt-cache policy nginx
    nginx:
      Installed: (none)
      Candidate: 1.24.0-2ubuntu7.15
      Version table:
         1.24.0-2ubuntu7.15 500
            500 http://th.archive.ubuntu.com/ubuntu noble-updates/main amd64 Packages
    ```

    *`Installed: (none)` — there is no web server on this machine yet. Note the version, and
    note which host it would come from. Both are about to change.*

2. Fetch nginx.org's signing key and store it in `/usr/share/keyrings/`, converted with
   `gpg --dearmor`.

    ```bash
    $ curl -fsSL https://nginx.org/keys/nginx_signing.key \
        | sudo gpg --dearmor -o /usr/share/keyrings/nginx-archive-keyring.gpg
    $ ls -l /usr/share/keyrings/nginx-archive-keyring.gpg
    -rw-r--r-- 1 root root 8538 Aug 19 14:05 /usr/share/keyrings/nginx-archive-keyring.gpg
    ```

    *This is the whole of "do I trust this software?". Packages from this repository are
    signed; apt will refuse anything that key does not vouch for. Without it you are
    downloading executables from a stranger and running them as root.*

3. Tell apt about the repository, in a file of its own, naming the key you just saved.

    ```bash
    $ echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/ubuntu $(lsb_release -cs) nginx" \
        | sudo tee /etc/apt/sources.list.d/nginx.list
    deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/ubuntu noble nginx
    ```

    *`signed-by=` binds this one repository to that one key. Without it, the key would be
    trusted for **every** repository on the machine, which is how a compromised third party
    ends up able to replace your kernel.*

    *`$(lsb_release -cs)` prints this release's codename. Type it if you prefer — but the
    command is the honest way to say "whichever Ubuntu this is".*

4. Refresh apt's lists, then ask the same question as step 1. Which **host** does the
   candidate come from now? **→ `T4`**

    ```bash
    $ sudo apt update
    ...
    $ apt-cache policy nginx
    nginx:
      Installed: (none)
      Candidate: 1.30.4-1~noble
      Version table:
         1.30.4-1~noble 500
            500 http://<...>/packages/ubuntu noble/nginx amd64 Packages
         ...
         1.24.0-2ubuntu7.15 500
            500 http://th.archive.ubuntu.com/ubuntu noble-updates/main amd64 Packages
    ```

    *Both are still listed, and apt picked the higher version. `1.30.4-1~noble` against
    `1.24.0-2ubuntu7.15`: the packager's suffix is how you tell at a glance whose build you
    are looking at. Your version numbers will be higher than these in time.*

5. Install it.

    ```bash
    $ sudo apt install nginx
    ...
    $ dpkg-query -W -f='${Status} ${Version}\n' nginx
    install ok installed 1.30.4-1~noble
    $ nginx -v
    nginx version: nginx/1.30.4
    ```

&nbsp;


---

### Part 2 - Running it as a service

**The misconception this part attacks:** that installing a server starts it. Installing
puts files on a disk. Everything you learned in classes 1 and 2 about `enabled` and
`active` now applies to something that other people can actually connect to.

| Command | What it does |
| :--- | :--- |
| `systemctl is-enabled <unit>` | Will it start at boot? |
| `systemctl is-active <unit>` | Is it running right now? |
| `systemctl enable --now <unit>` | Both at once |
| `systemctl status <unit>` | The two states, the main pid, and recent log lines |
| `journalctl -u <unit>` | That unit's log — class 2, on something real |
| `ps -o user,pid,ppid,cmd -C <name>` | Which processes, and **whose** they are |

6. **Before we start anything**, ask whether nginx would start at boot. What does it
    print? **→ `T6`**

    ```bash
    $ systemctl is-enabled nginx
    <...>
    ```

    ***Into `answers.yaml` now.*** *Once we run step 8 it is gone, and nothing gives it
    back — not this sheet, and not the marked lab.*

7. Now ask whether it is running. What does it print? **→ `T7`**

    ```bash
    $ systemctl is-active nginx
    <...>
    ```

    ***Into `answers.yaml` too, before you go on.***

    *Two independent states, exactly as in lab01 part 4 and lab02 part 4. Read your two
    answers together: the package has made a decision about one of them and not the other.
    That is a packaging convention, not a rule of systemd — and it is why "I installed it"
    and "it is running" are different sentences.*

8. Enable **and** start it, then look at the full status.

    ```bash
    $ sudo systemctl enable --now nginx
    $ systemctl status nginx
    ● nginx.service - nginx - high performance web server
         Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; preset: enabled)
         Active: active (running) since Wed 2026-08-19 14:12:27 +07; 14ms ago
           Docs: https://nginx.org/en/docs/
       Main PID: 264545 (nginx)
          Tasks: 3 (limit: 4465)
         CGroup: /system.slice/nginx.service
                 ├─264545 "nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf"
                 ├─264546 "nginx: worker process"
    ```

9. Look at the processes themselves. Which user do the **worker** processes run
    as? **→ `T9`**

    ```bash
    $ ps -o user,pid,ppid,cmd -C nginx
    USER         PID    PPID CMD
    <...>     264545       1 nginx: master process /usr/sbin/nginx -c /etc/nginx/nginx.conf
    <...>     264546  264545 nginx: worker process
    <...>     264547  264545 nginx: worker process
    ```

10. And which user does the **master** process run as? **→ `T10`**

    *No new command — the answer is in the output you already have. You can run it again any
    time today, so this pair is not one of the four you can lose.*

    *This is the service lab02 step 4 promised you: one that deliberately does not run
    everything as the same user. Only the master needs privilege, because only the master
    binds port 80 — ports below 1024 need root. The workers, which are the ones that
    actually read your files and talk to strangers on the internet, drop it immediately.
    When a file of yours turns out to be unreadable later in this course, this is why.*

    *`grep user /etc/nginx/nginx.conf` shows where that second user is configured.*

&nbsp;


---

### Part 3 - Listening is not the same as reachable

**The misconception this part attacks:** that a server which answers `curl localhost` is
deployed. It is answering **itself**. Between your running server and an actual visitor
there is a firewall, and on this machine it is switched on and it is not letting anybody in.

This is the part of the afternoon that matters most. Every remaining class in this course
deploys something on a port, and this failure looks identical every time: it works
perfectly on the machine, and nobody else can see it.

| Command | What it does |
| :--- | :--- |
| `ss -tln` | Which **ports** are listening, on which addresses |
| `curl -I <url>` | Fetch just the response headers |
| `sudo ufw status verbose` | The firewall's rules |
| `sudo ufw allow <port>/tcp` | Let one port through |
| `sudo ufw delete allow <port>/tcp` | Delete the rule |
| `sudo ufw show listening` | Show the listening report |

11. List the listening ports and find the one nginx opened.

    ```bash
    $ ss -tln
    State  Recv-Q Send-Q  Local Address:Port  Peer Address:Port
    LISTEN 0      511           0.0.0.0:80         0.0.0.0:*
    LISTEN 0      4096          0.0.0.0:22         0.0.0.0:*
    LISTEN 0      4096       127.0.0.53%lo:53      0.0.0.0:*
    ```

    *`0.0.0.0` means every address on this machine, so the server is not the thing
    restricting who may connect. Compare it with the resolver on `127.0.0.53`, which is
    listening only to the machine itself. That distinction returns in class 5.*

12. Fetch the site from the VM itself. Nothing of yours is on this server yet — so whose
    page do you get? **→ `T12`**

    ```bash
    $ curl -s http://localhost/ | head -5
    <!DOCTYPE html>
    <html>
    <head>
    <title>Welcome to <...>!</title>
    ```

    *It works. Remember how convincing that felt when you read the next step.*

13. Now, **from your own computer**, open `http://<your-vm>.sit.kmutt.ac.th/` — a browser,
    or `curl` on your laptop. Wait for it. Did the page load? **→ `T13`**

    ```
    $ curl --connect-timeout 5 http://lvmXXYYY.sit.kmutt.ac.th/
    <...>
    ```

    ***Into `answers.yaml` before you go on.*** *The next step makes this impossible to see
    again, and it is asked nowhere else.*

    *Nothing about the server changed between step 12 and step 13 — the same nginx, the same
    port, the same page. Only the question changed. Step 12 asked the machine about itself;
    step 13 asks it about you.*

    *Look closely at **how** it ends, not just at whether you got a page. There are several
    different ways a request like this can finish and they are not interchangeable: a refusal
    is a machine saying "not here", a silence is a machine saying nothing at all — which is
    what a dropped packet looks like — and a page is a machine saying yes. Which of them you
    get is what tells you whether to go and look at a firewall or at a service.*

14. Look at the firewall, let port 80 through, and try step 13 again from your own computer.
    Does it load now? **→ `T14`**

    ```bash
    $ sudo ufw status verbose
    Status: active
    Logging: on (low)
    Default: deny (incoming), allow (outgoing), disabled (routed)
    New profiles: skip

    To                         Action      From
    --                         ------      ----
    22/tcp (OpenSSH)           ALLOW IN    Anywhere
    $ sudo ufw allow 80/tcp
    Rule added
    ```

    *`deny (incoming)` was doing this. The only reason you could ssh in at all is the one
    rule that was already there — and somebody added that rule for you before you ever
    logged in.*

    ***Open only what you need.*** *It is tempting to switch the firewall off and get on with
    the lab. Do not: you will spend the rest of this course adding services on ports that
    should not be public, and in class 5 you will close one of them again on purpose.*

&nbsp;


---

### Part 4 - Which block answers?

**The misconception this part attacks:** that writing a server block puts your site on the web.
nginx can hold several blocks claiming port 80, and it picks **exactly one** of them for each
request. Yours can be correct in every line, pass `nginx -t`, be reloaded cleanly — and never be
the one chosen. Knowing how it chooses is the difference between fixing that in a minute and
rewriting a working file all afternoon.

| Command | What it does |
| :--- | :--- |
| `include /etc/nginx/conf.d/*.conf;` | Where nginx picks up the rest of its configuration |
| `server { ... }` | One site: which port, which names, which directory |
| `server_name <name>` | Which `Host:` values this block **claims** |
| `root` / `index` | The directory to serve, and what to send for a directory |
| `curl -H 'Host: <name>' <url>` | Ask for one site **by name**, without DNS |
| `listen 80 default_server` | Answer for any `Host` that no block claims |
| `sudo nginx -t` | Check the configuration **without** applying it |
| `sudo systemctl reload nginx` | Re-read it, without dropping connections |

15. Find where the rest of the configuration is pulled in, and look at what is already there.

    ```bash
    $ grep -n include /etc/nginx/nginx.conf
    15:    include       /etc/nginx/mime.types;
    31:    include /etc/nginx/conf.d/*.conf;
    $ ls /etc/nginx/conf.d/
    <...>
    ```

    *Two details in that one line, and the whole of this part rests on them: **only** names
    ending `.conf` are read, and they are read **in the order they sort**.*

16. Make a directory for your own site, and put one page in it. Put your student number on the
    page — it is how you tell your page from anybody else's.

    ```bash
    $ sudo mkdir -p /var/www/classsite
    $ echo '<h1>INT134 class site — <your student number></h1>' \
        | sudo tee /var/www/classsite/index.html
    $ cat /var/www/classsite/index.html
    <h1>INT134 class site — <...></h1>
    ```

17. Write a server block for it in `/etc/nginx/conf.d/site.conf`, then check it and apply it.

    ```nginx
    server {
        listen      80;
        server_name class.int134;

        root  /var/www/classsite;
        index index.html;
    }
    ```

    ```bash
    $ sudo nginx -t
    nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
    nginx: configuration file /etc/nginx/nginx.conf test is successful
    $ sudo systemctl reload nginx
    ```

    *`class.int134` is a made-up name. Nothing in DNS has heard of it and that is fine — the
    next step asks for it by hand.*

    *`nginx -t` reads the configuration and tells you whether it would load, **without** touching
    the running server. Run it before every reload: a reload with a broken file keeps the old
    configuration running, but a **restart** with a broken file leaves you with no web server at
    all.*

18. Ask for your site **by name**. Then ask for it the way a visitor would — by your VM's real
    address. Which page does that second request give you? **→ `T18`**

    ```bash
    $ curl -s -H 'Host: class.int134' http://localhost/
    <h1>INT134 class site — <...></h1>
    $ curl -s http://<your-vm>.sit.kmutt.ac.th/ | grep -i '<h1>'
    <...>
    ```

    ***Nothing is broken.*** *`nginx -t` passed, the block is correct, and your site answers to
    the name it claims. But a visitor typing your VM's address sends **that address** as the
    `Host:` header, and no block on your machine claims it.*

    *When no `server_name` matches, nginx falls back to the **default server** for that port — and
    the default server is simply the block it **read first**. `conf.d` is read in sorted order, and
    your file sorts after the one that was already there.*

19. So change the order. Rename your file so that it sorts first, apply it, and ask as a visitor
    again. What did you change to make your site win? **→ `T19`**

    ```bash
    $ sudo mv /etc/nginx/conf.d/site.conf /etc/nginx/conf.d/0_site.conf
    $ sudo nginx -t
    nginx: configuration file /etc/nginx/nginx.conf test is successful
    $ sudo systemctl reload nginx
    $ ls /etc/nginx/conf.d/
    0_site.conf  <...>
    $ curl -s http://<your-vm>.sit.kmutt.ac.th/ | grep -i '<h1>'
    <h1>INT134 class site — <...></h1>
    ```

    *You changed a **filename** and the site that answers the internet changed with it. That is
    why `/etc/` is full of directories whose files begin `0_`, `10-`, `50-`, `99-`: when a
    directory is read in sorted order, the number at the front is how an operator says what comes
    first.*

    ***A reload is not instant.*** *The old worker processes finish what they are doing before the
    new ones take over. A request sent immediately after a reload gets the OLD configuration about
    half the time. If the page looks unchanged, wait a second and ask again before you start
    debugging.*

20. Sorting works, and it is fragile — the next person to add a file does not know your rule.
    Say it outright instead. Rename your file **back**, so it sorts last again, then add one
    keyword to its `listen` line so that it answers for unclaimed names anyway. Which keyword is
    it? **→ `T20`**

    ```bash
    $ sudo mv /etc/nginx/conf.d/0_site.conf /etc/nginx/conf.d/site.conf
    $ grep -n listen /etc/nginx/conf.d/site.conf
    2:    listen      80 <...>;
    $ sudo nginx -t
    nginx: configuration file /etc/nginx/nginx.conf test is successful
    $ sudo systemctl reload nginx
    $ curl -s http://<your-vm>.sit.kmutt.ac.th/ | grep -i '<h1>'
    <h1>INT134 class site — <...></h1>
    ```

    *Your file sorts last and it wins anyway. One block per port may say this; a second one
    claiming it is an error, and nginx will tell you so rather than choose.*

21. One last request, and it is the one that shows the whole rule at once. Ask your machine for
    three different names and watch which block answers each.

    ```bash
    $ curl -s -H 'Host: class.int134' http://localhost/ | grep -i '<h1>'
    <h1>INT134 class site — <...></h1>
    $ curl -s -H 'Host: nobody.claims.this' http://localhost/ | grep -i '<h1>'
    <h1>INT134 class site — <...></h1>
    $ curl -s -H 'Host: localhost' http://localhost/ | grep -i '<h1>'
    <...>
    ```

    *Read those three together — they are the whole of how nginx chooses:*

    - *a name a block **claims** goes to that block;*
    - *a name **nobody** claims goes to the default server, which is yours now;*
    - *and the third one still does not come to you, because a block that claims a name **by
      name** beats the default server. Matching happens first; the default is only the fallback.*

22. Run the checker one last time before you go.

    ```bash
    $ int134 check lab03class
    ```

    *Three lines to read together. "Something is listening on port 80" and "your web server
    answers from outside your VM": if the first passes and the second does not, there is nothing
    wrong with your web server — go back to step 14. And "the page on port 80 is yours": if that
    one fails while the other two pass, your block is not the one being chosen — go back to
    step 19.*

&nbsp;


---

### What is checked

`int134 check lab03class` looks at three things: the state of your machine, **your machine as
seen from my server**, and your answers.

**On your machine:**

| Part | Checked |
| :--- | :--- |
| 1 | nginx is installed, and is the build from the repository we added rather than the distribution's |
| 2 | nginx starts at boot; nginx is running now; its workers are not the same user as its master |
| 3 | something is listening on port 80 |

**From my server, over the network.** Two checks, and they fail for different reasons:

- **your web server answers on port 80 at all** — if this fails while "something is listening"
  passes, it is the firewall;
- **the page on port 80 is one you wrote** — if this fails while the first passes, your server
  is fine and your block is simply not the one being chosen. That is Part 4.

Neither check reads your page for anything in particular — only that one of them came back, and
that it is yours. Next week you replace it with a different page of your own, and both checks
have to keep passing.

**From your answer file.** `T4`, `T6`, `T7`, `T9`, `T10`, `T12`, `T13`, `T14`, `T18`, `T19`,
`T20`.

**The firewall is not checked directly, and does not need to be.** `sudo ufw status` needs
privileges the checker does not have — but the probe from my server tests the same thing
better. If your machine says port 80 is listening and my server cannot reach it, the
firewall is the only thing left. That pairing is the diagnosis, and it is why those two
checks exist as a pair.

**Steps 6, 7, 12, 13 and 18 are not checked on the machine, and cannot be.** Their end state is
identical to having done nothing: a service you then started, a request that timed out, a page
you read once, a block that was not chosen until you changed it. What you saw happen is evidence
only you have — which is exactly why those steps are questions.

---

### After class

`lab03` is the marked lab, and it opens at the end of this session. **It does not repeat this
afternoon.** It starts at its own step 1 and assumes the machine you are leaving with: you fork
the noticeboard application, serve **your own** site instead of whatever your machine is serving
now, put your student number in it, and find out what a file server does when you ask it to
store something.

It opens with a short readiness check — nginx installed and from the right repository, running,
listening, reachable. Those are today's work, so if you finished today they are already passing
and it costs you two minutes. **If you did not finish today, finish this sheet first.** It has no
deadline and no marks, and `lab03` cannot be done on a machine that has not been through it.

**It will also make you deal with the block you wrote today.** You will have two sites claiming
port 80 and only one can answer an unclaimed name. Everything you need to sort that out is
Part 4.
