# INT134 System Deployment
## Class 05 Reverse Proxy, Integration and TLS

### Lab Instructions

1. It is best to learn from experiment, read command help, and figure out the solution yourself.

2. Do not search for the answer on internet or use AI.

3. Do not ask or copy answers from your friend.

---

### Setup

1. Connect to your `int134` VM with ssh.

2. Create a directory `~/int134/lab05class/` under your home directory and change working
    directory to this directory.

3. Copy `/home/public/labs/lab05class/answers.yaml` to `~/int134/lab05class/answers.yaml`.

4. Modify `answers.yaml`: set your student ID and your full name.

**You need class 4 working.** `systemctl is-active school-api` must say `active`, and
`curl -s http://127.0.0.1:<your port>/api/health` on the VM must answer. Nothing is installed
today.

**You need a browser, with its developer tools open.** Half of this class happens inside a
**page**, and no command-line tool is ever a page. That difference is the point of Part 2.

**Two numbers are yours all afternoon.** Class 4 gave your API the port `3` followed by the last
three digits of your VM's name. Today your page gets `8` and the same three digits. On
`lvm68136` that is `3136` for the API and `8136` for the page; substitute your own everywhere
you see `<api port>` and `<page port>`.

---

### What today is

Class 3 deployed a web site. Class 4 deployed an application and a database. They are on the
same machine and they have never spoken to each other.

Today they do — and the first attempt fails, in a way that has nothing to do with either of
them being broken. Fixing it properly takes the deployment apart twice and ends with **fewer**
moving parts than it started with: one address, one door, and that door encrypted.

Six things, in order. Each one makes the previous arrangement unnecessary, so **do them in
order** — the interesting part of this class is *why* each fix is not the last one.

| | You will | And it leaves |
| :--- | :--- | :--- |
| 1 | Serve the school page on its own port | a page that cannot read its own API |
| 2 | Find out who refused, and why | a refusal you can explain |
| 3 | Let the API permit the page | two ports and a setting that must match |
| 4 | Put nginx in front of the API instead | one address, and a door to shut |
| 5 | Move the page under a path on port 80 | one port |
| 6 | Give the machine a certificate | one door, encrypted |

**Run `int134 check lab05class` at the end of every part.** It records what you have done so
far. Nothing you do later takes away what an earlier part earned.

---

### Part 1 - A second site

**Nothing here is new, so nothing here is spelled out.** Class 3 published a document root and
wrote a server block; you are doing it again, for a second application, on a port of your own.
The blocks below show what right looks like when you get there.

One line is worth repeating, because it is the only one whose options you would still get wrong
knowing the command:

```bash
rsync -a --chmod=D755,F644 --delete --exclude <file> <src>/ <dst>/
```

| | |
| :--- | :--- |
| `-a` | preserve what the source carries — including its modes |
| `--chmod=D755,F644` | …except these, which a published copy states for itself |
| `--delete` | what you removed from the source goes from the copy |
| `--exclude <file>` | one file the deploy must never overwrite |

1. Publish the school front end into a document root of its own and serve it on your page port.

    - the source is `/srv/school/frontend`; the document root is **`/var/www/school`**
    - **keep `config.js` out of the sync** — step 2 creates it, and nothing should overwrite it
    - the server block goes in **a file of its own**, `/etc/nginx/conf.d/school.conf`, claiming
      your VM's two names and your page port
    - let that port through the firewall

    ```bash
    # publish the copy, then list what you published
    total 16
    -rw-r--r-- 1 sysadmin sysadmin 2219 Sep  2 14:05 app.js
    -rw-r--r-- 1 sysadmin sysadmin  661 Sep  2 14:05 config.example.js
    -rw-r--r-- 1 sysadmin sysadmin 1744 Sep  2 14:05 index.html
    -rw-r--r-- 1 sysadmin sysadmin 1621 Sep  2 14:05 style.css
    ```

    ```bash
    # check the configuration, apply it, and see what is listening
    nginx: configuration file /etc/nginx/nginx.conf test is successful
    LISTEN 0      511          0.0.0.0:<page port>   0.0.0.0:*
    ```

    ```bash
    # open the port, then ask this machine for the page
    Rule added
    HTTP/1.1 200 OK
    ```

    ***`/srv/school` is the source; `/var/www/school` is what the world is handed.*** *You made
    that distinction in class 3 and it matters more here, because `/srv/school/backend/.env`
    holds your database password. A web server hands out whatever is under its root without
    asking what it is. Point a root at `/srv/school` and you have published your credentials —
    so the root is the **document root you just made**, and never the directory above it.*

    ***No `w` in the group column.*** *Compare that listing with `ls -l /srv/school/frontend`.
    Same files, two directories, two sets of modes, and the flag on the command line is what
    puts them there.*

    ***Why a file of its own, rather than a second `server` in the noticeboard's?*** *Because
    `conf.d/*.conf` is included wholesale, and one file per site is how you take one out of
    service without touching the other. Part 5 merges the two sites onto one address — and
    **keeps** that property, by a different mechanism.*

    ***Check that your API's port is open too.*** *Class 4, step 25, opened it. If it is
    missing, open it again before you go on: Part 2 depends on the API being reachable from
    your own computer, and a closed port fails in a way that looks nothing like what you are
    about to see — you would spend the next four steps diagnosing the wrong thing.*

2. Create `/var/www/school/config.js`. It needs your student number, and the address the page
    should fetch the register from — **which today is the API on its own port, spelled out in
    full**:

    ```javascript
    window.INT134 = {
      studentId: "<your 11-digit student number>",
      studentsUrl: "http://<your VM>.sit.kmutt.ac.th:<api port>/api/students",
    };
    ```

    *A full address, not a path — and **not** the value `config.example.js` carries beside it,
    which is where Part 5 ends up rather than where today starts. That is deliberate and it is
    what Part 2 is about.*

3. Open `http://<your VM>.sit.kmutt.ac.th:<page port>/` in a browser on **your own computer**.

    The page appears. The register does not. **What does the page show where the list of
    students should be?**  **→ `T3`**

    ***Nothing is broken.*** *The page is served, the API is running, and the address in
    `config.js` is correct — you can prove all three in the next four steps. This is what a
    working deployment of two parts looks like before anybody has thought about how they talk.*

---

### Part 2 - Two origins

**The misconception this part attacks:** that a request failing means a server refused it. The
server answered. Something else decided you could not read the answer.

| Where to look | What you are looking for |
| :--- | :--- |
| Developer tools → **Console** | why the browser stopped it |
| Developer tools → **Network** | whether the request was made at all, and what came back |
| `curl -i <url>` | the reply, headers and all, with no page asking for it |
| The browser's address bar | the same URL again, fetched as a page in its own right |

4. Open the developer tools in your browser — **F12**, or right-click and *Inspect* — choose
    the **Console** tab, and reload the page.

    There is a message there. **Write down what it says.**  **→ `T4`**

    ```
    <...>
    ```

    ***Read the whole thing, not the first line.*** *It names two addresses and the thing it
    could not find. Every one of those three is part of the answer to a later step.*

    ***This is the longest answer in the lab, so watch how your editor wraps it.*** *Every
    line of an answer must be indented under its key. If the paste breaks across two lines and
    the second one starts at the left margin, the file stops being valid YAML — and `int134
    check` will refuse to submit anything until you fix it. Indent the second line to match the
    first, or turn your editor's line wrapping off.*

5. Now ask for the same URL two more times. Once from the VM's command line, and once by
    typing it straight into **your browser's address bar**:

    ```bash
    # ask for it from the VM's command line -- the SAME address the page asked
    # for, not the loopback, or you have changed two things at once
    [{"studentId":"68130500170","firstName":"SOMCHAI","lastName":"JAIDEE","major":"IT"},{"st
    ```

    ```
    http://<your VM>.sit.kmutt.ac.th:<api port>/api/students
    ```

    **Did they work?**  **→ `T5`**

    ***The same browser, the same URL, and this time the data is there.*** *So it is not that
    the browser will not talk to that address — it just did. It is not the API and it is not
    the network either. The only thing that changed is **who was asking**: a moment ago the
    request came from a script inside a page that had been served from somewhere else. That
    single difference is the whole of Part 2.*

6. Look carefully at the two addresses in the console message: the one the page was **served
    from**, and the one it **asked**. Write down **what differs between them, and what is the
    same.**  **→ `T6`**

    ```
    differs:  <...>
    same:     <...>
    ```

    ***A browser calls that pair an origin, and its definition is stricter than it looks.***
    *Scheme, host and port — **all three** must match, or it is a different origin and a
    different set of rules applies to it.*

7. Ask the API again, this time for the **headers** of its reply:

    ```bash
    # ask the API for the HEADERS of its reply, and nothing else
    HTTP/1.1 200 OK
    Content-Type: application/json; charset=utf-8
    Content-Length: 246
    ETag: W/"f6-JX0ktb7uR1DohV2JqUg5kKgjs9U"
    Date: Tue, 01 Sep 2026 10:05:43 GMT
    Connection: keep-alive
    Keep-Alive: timeout=5
    ```

    The console message in step 4 named a header it was looking for. It is not in that list.
    **Which header?**  **→ `T7`**

    ***This is the whole mechanism.*** *The API answered `200`, with the data. The browser
    fetched it, looked for permission to hand it **to that page**, found none, and threw the
    answer away. **The refusal happens in the browser, after a successful response, and only
    against the page that asked.** That is why step 5 worked both times: neither the command
    line nor the address bar was asking on behalf of a page from anywhere else, so there was
    nobody to withhold the answer from. And it is why the server's own log looks the same in
    all three cases — nothing went wrong at the server.*

---

### Part 3 - Fixing it in the application

**The misconception this part attacks:** that a fix which works is finished.

| Setting | Where |
| :--- | :--- |
| `CORS_ORIGIN` | `/srv/school/backend/.env` — the service's environment file, from class 4 |
| `journalctl -u <unit> -n <n>` | what the service said when it last started |

8. Tell the API which origin is allowed to read its answers. Edit
    `/srv/school/backend/.env` and set `CORS_ORIGIN` to **the address the page is served
    from** — scheme, host and port, exactly as the console printed it, and nothing after it.

    ```bash
    # open the service's environment file, /srv/school/backend/.env
    CORS_ORIGIN="http://<your VM>.sit.kmutt.ac.th:<page port>"
    ```

    ***No trailing slash, and the port is part of it.*** *This is compared as a string against
    the origin the browser sends. `.../` does not match, and neither does the host without the
    port. Class 4's percent-encoding lesson had the same shape: a value that is nearly right
    fails in a way that looks like the code is broken.*

9. Restart the service, and read what it said as it came up.

    ```bash
    # restart the service, then read the last few lines of its journal
    <...>
    ```

    **One of those lines is about the setting you just changed.** Read it before you go on —
    if it does not say what you expected, the next step will not work and you will have already
    seen why.

    ***Restart, not reload.*** *An environment file is read once, when the process starts.
    Class 4 taught this and it is the commonest reason a change to `.env` appears to do
    nothing.*

10. Reload the page in your browser. **Did the register appear?**  **→ `T10`**

11. Stop and count what you now have to keep in step. Suppose you had to move the page to a
    different port tomorrow. **What else would you have to change, and where?**  **→ `T11`**

    ***It works, and it is not a good arrangement.*** *Count the things you would have to
    touch, and where each of them lives. Nothing here is wrong; there is simply more of it
    than there needs to be, and Part 4 is about having less.*

---

### Part 4 - Fixing it properly

**The idea:** do not permit the boundary — remove it. If the page and the API answer on the
**same** origin, the rule you spent Part 3 configuring never applies at all.

| Directive | What it does |
| :--- | :--- |
| `location /api/ { ... }` | Handle requests whose path starts with `/api/` differently |
| `proxy_pass http://127.0.0.1:<port>;` | Send them on to something else and return its answer |
| `proxy_set_header <name> <value>;` | Add or replace a header on the request nginx sends |
| `nc -l 127.0.0.1 <port>` | Listen on a port and print whatever arrives, verbatim |

12. Add a `location /api/` block to your **school** server block, and point it — for the next
    two steps only — at a port with nothing behind it:

    ```nginx
    location /api/ {
        proxy_pass http://127.0.0.1:9099;
    }
    ```

    Check and apply it.

13. In one terminal, listen on that port. In another, ask your page's address for the register.
    Then look at what the first terminal printed.

    ```bash
    # terminal 1 -- nc is new today, so here it is in full
    $ nc -l 127.0.0.1 9099

    # terminal 2: ask your PAGE's address for the register, with a short timeout
    # (nothing will answer, which is the point -- you are reading what arrives)
    ```

    ```
    <...>
    ```

    **What `Host` did nginx send, and what is *not* in that request?**  **→ `T13`**

    ***That is not your request.*** *A reverse proxy does not forward what it received; it
    **composes a new request** and sends that. Everything the API is about to be told about
    who is calling, nginx decided.*

    *`nc` prints one request and exits. If you want to look again, start it again.*

14. Now tell nginx what to say. Add these four lines inside the same `location`, apply, and
    repeat the experiment from step 13 exactly.

    ```nginx
    location /api/ {
        proxy_pass http://127.0.0.1:9099;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    ```

    ```
    <...>
    ```

    **What is different this time?**  **→ `T14`**

    ***This is why the header block is not decoration.*** *Without it the API believes every
    request in the world came from `127.0.0.1`, which makes its logs useless, its rate limits
    meaningless and its "who did this" unanswerable. You have just watched the difference
    rather than been told it.*

15. Point `proxy_pass` at the real API — your own port — and apply.

    ```nginx
    proxy_pass http://127.0.0.1:<api port>;
    ```

    ```bash
    # ask your PAGE's port for the API's health endpoint
    {"ok":true,"student":"<your student number>","time":"..."}
    ```

    ***Your page's port, and no `/api/` service is running on it.*** *nginx served the page
    from a directory and this request from another program, on the strength of the path alone.*

16. Point the page at its own origin. Edit `/var/www/school/config.js` and replace the whole
    address with a path:

    ```javascript
    studentsUrl: "/api/students",
    ```

    Reload the page. The register is there.

    ***A path means "ask whoever served me this page".*** *No host, no port, nothing to keep in
    step with anything else.*

17. Now take the Part 3 fix away. Empty `CORS_ORIGIN` in `/srv/school/backend/.env`, restart
    the service, and reload the page.

    ```
    CORS_ORIGIN=""
    ```

    It still works — and this time the console is empty, so nothing hands you the addresses.
    Take the first from your browser's **address bar**. For the second, open the **Network**
    tab, select the request for the register, and read its **Request URL**.  **→ `T17`**

    ```
    served from:  <...>
    asks for:     <...>
    ```

    ***Put them one above the other and read them.*** *In step 6 you found that the two
    addresses differed by their port. `config.js` still says only `/api/students` — no scheme,
    no host, no port — so the browser built the second address out of the first. Nothing was
    permitted this time; there is nothing left to permit.*

18. The API no longer needs to be reachable from anywhere except this machine. Make it
    listen only where nginx reaches it from: set `HOST` in the same file, restart the service,
    and read the startup line.

    ```bash
    # read the last few lines of the service's journal
    <...>
    ```

    **What address does it say it is listening on?**  **→ `T18`**

    ***Check `ss -tln` too, and compare it with what class 4 showed you.*** *A service bound
    to every address accepts connections from the network whatever the firewall says; one
    bound to a single local address cannot, even with the firewall wide open. Two independent
    locks, and this is the inner one.*

19. Close the API's port in the firewall — the rule class 4 added, which nothing needs now.

    ```bash
    # delete the firewall rule class 4 added for the API's port
    Rule deleted
    ```

    From **your own computer**, ask that port for the health endpoint.
    **Does it answer?**  **→ `T19`**

    ***A port you no longer use is not harmless.*** *It is a way in that nobody is watching. You
    opened it last week because you needed it; you do not need it now.*

---

### Part 5 - One origin, one door

The API is behind one address. The machine, though, still answers on two — the noticeboard on
80 and the school on your page port — and only one of them is a door you would defend.

| Directive | What it does |
| :--- | :--- |
| `location /school/ { alias <dir>/; }` | Serve `<dir>` for URLs starting `/school/` |
| `proxy_pass http://127.0.0.1:<port>/api/;` | …and **replace** the matched prefix with `/api/` |
| `include <path>;` | Read another file in, exactly here |

20. Two files are about to stop meaning what their names say, so rename first, then merge.

    **Rename** `/etc/nginx/conf.d/noticeboard.conf` to **`http-default.conf`**. It is no longer
    the noticeboard's file: it is about to hold two applications, and what it really is — what
    nginx picks it for — is *the server that answers on port 80 for this machine's names, and
    for any name nobody else claims*.

    **Then put the school's two locations in a file of their own**,
    `/etc/nginx/conf.d/school.location`:

    ```nginx
    location /school/ {
        alias /var/www/school/;
        index index.html;
        try_files $uri $uri/ =404;
    }

    location /school/api/ {
        proxy_pass http://127.0.0.1:<api port>/api/;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    ```

    **And read it into the server block** in `http-default.conf`, inside the braces, below the
    noticeboard's own locations:

    ```nginx
    include conf.d/school.location;
    ```

    ***Not `.conf`, and that is the whole reason it works.*** *nginx loads
    `conf.d/*.conf` by itself. A `location` is only legal inside a `server`, so a fragment
    picked up on its own would be a configuration error — name it `.conf` and `nginx -t` tells
    you so. The `include` above is what puts it where it belongs. A relative path is read from
    `/etc/nginx`, which is why it is `conf.d/school.location` and not the full path.*

    ***This is the property you were told about in step 1, kept.*** *Two files per site let you
    take one out of service without touching the other. Merging the sites onto one address
    would have thrown that away — except that the school is now one `include` line, and
    commenting out one line is still how you take it offline.*

    ***`alias`, not `root`, and the trailing slashes are not optional.*** *`root` appends the
    **whole** URL path to the directory, so `root /var/www/school` would look for
    `/var/www/school/school/index.html`. `alias` **replaces** the matched part instead. Both
    the location and the alias end in `/`, or you get the two glued together and a 404 you
    will stare at.*

    ***Four locations now, and the longest prefix wins.*** *`/school/api/students` matches both
    `/school/` and `/school/api/`, and nginx takes the **longer** one — not the first it reads.
    So the order they are written in, and which file each arrived from, change nothing. (A
    regular-expression location plays by different rules and would beat both; there are none
    here.) The algorithm is written out in full at
    <https://nginx.org/en/docs/http/request_processing.html>, and you will want it again in
    Part 6.*

21. Take `school.conf` out of service — **without deleting it** — then check and apply.

    ```bash
    # take the school's own server block out of service, check, and reload
    nginx: configuration file /etc/nginx/nginx.conf test is successful
    ```

    ***Out of service, not gone.*** *Class 3 gave you the move: nginx reads `conf.d/*.conf` and
    nothing else, so a file that no longer ends in `.conf` is a file nginx does not read. It is
    still there to look at when you want to remember what you had.*

22. Point the page at where it now lives:

    ```javascript
    studentsUrl: "/school/api/students",
    ```

    Open `http://<your VM>.sit.kmutt.ac.th/school/` — no port — and check the register.

    Then ask this machine for that page **without** the trailing slash:

    ```bash
    # ask for /school -- no trailing slash -- and read the status line only
    HTTP/1.1 404 Not Found
    ```

    ***That one is not your mistake.*** *`location /school/` matches paths that **begin with**
    `/school/`, and `/school` does not — so none of your locations matched it at all. It fell
    to `location /`, which serves the noticeboard's directory, and there is no `school` in
    there. nginx will add a missing slash for you, but only after a location has matched and
    turned out to be a directory; here nothing matched.*

    ***Do not repair it by serving the page at `/school` as well.*** *A page opened at
    `/school` asks for `style.css`, `config.js` and `app.js` relative to **`/`** — and the
    noticeboard has files by all three names, so all three answer `200`. You would be looking
    at the school page wearing the noticeboard's configuration, with nothing anywhere to tell
    you. What is wanted is to send the browser to the address that works, and **Part 6 gives
    you the directive that does it**.*

23. Close the page port, and read the firewall back.

    ```bash
    # delete the page port's rule, then read the rules back
    Rule deleted
    <...>
    ```

    **How many ports does this machine allow in now, and which?**  **→ `T23`**

24. One last thing about that proxy line. Ask for the health endpoint through the new path, and
    then look at what the API says it received:

    ```bash
    # ask for the health endpoint through the new path, then read the last
    # couple of lines of the API's journal
    <...>
    ```

    **Which path did the API say it received?**  **→ `T24`**

    ***That is the trailing slash on `proxy_pass`.*** *With `/api/` on the end, nginx replaces
    the part of the path that matched the location. Without it, the whole path is passed
    through and the API is asked for something it has never heard of. It is one character, and
    it is the single commonest mistake in this configuration.*

---

### Part 6 - The door, encrypted

Everything on this machine now arrives on port 80, in clear text — including, when you log in
to the register, whatever you type into it. The last change is to put a certificate in front of
it.

| Command | What it does |
| :--- | :--- |
| `openssl req -x509 -nodes -newkey rsa:2048 -days <n> -keyout <key> -out <crt>` | Make a key and a certificate that vouches for itself |
| `-subj "/CN=<name>"` | Who the certificate says it is |
| `-addext "subjectAltName=DNS:<name>,DNS:<name>"` | The names it is valid for — browsers read **this**, not `CN` |
| `listen 443 ssl;` | Answer TLS on the standard port |
| `return 308 <url>;` | Send the caller somewhere else, permanently |

25. Make a certificate for **this machine**, and keep it somewhere of its own.

    ```bash
    # make a directory of its own: /etc/ssl/int134

    # openssl is new today, so this one is spelled out
    $ sudo openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
        -keyout /etc/ssl/int134/vm.key -out /etc/ssl/int134/vm.crt \
        -subj "/CN=$(hostname -f)" \
        -addext "subjectAltName=DNS:$(hostname -f),DNS:$(hostname)"

    # then set the modes: the key readable only by root, the certificate by all

    # and read back what you made
    $ openssl x509 -in /etc/ssl/int134/vm.crt -noout -subject -dates
    subject=CN = <your VM>.sit.kmutt.ac.th
    notBefore=Sep  2 07:15:00 2026 GMT
    notAfter=Sep  2 07:15:00 2027 GMT
    ```

    ***The key is `600` and the certificate is `644`, and that is not fussiness.*** *The
    certificate is public — it is sent to everyone who connects. The key is the entire secret;
    anyone who reads it can impersonate this machine. They live in the same directory and they
    are not the same kind of thing.*

26. Make the second server — the one that answers TLS. **Copy the file you already have**,
    `http-default.conf`, to **`https-default.conf`**, and change exactly two things in the copy:

    - the port it listens on, and that it speaks TLS: `listen 443 ssl default_server;`
    - the certificate and key you just made, named in two new directives

    ```nginx
    server {
        listen      443 ssl default_server;
        server_name <your VM's two names>;

        ssl_certificate     <...>;
        ssl_certificate_key <...>;

        # everything else is exactly what you copied — the same logs, root and
        # index, the noticeboard's locations, and the same one-line include
    }
    ```

    ***One file per server, and a server is a port and a set of names.*** *That is why the copy
    is a whole file rather than a second block pasted into the first: `http-default.conf` and
    `https-default.conf` are two servers, and each is one file you can read, disable or
    rename on its own.*

    ***The school comes with it, and you did not have to think about it.*** *The `include` line
    was copied like everything else, so `/school/` and `/school/api/` are served over TLS the
    moment this block loads — one file, two servers, no second copy to keep in step. That is
    what step 20 bought.*

    ***Copy the file; do not empty the old one yet.*** *Port 80 keeps working for one more
    step, which is what lets you check the new server before anything depends on it.*

27. Open 443, check and apply.

    ```bash
    # let 443 through, check the configuration, apply it, then ask over TLS
    HTTP/1.1 200 OK
    ```

    ***`-k` tells curl not to verify the certificate.*** *You will need it every time you test
    from the command line today, and step 28 is about why.*

28. Open `https://<your VM>.sit.kmutt.ac.th/school/` in your browser.

    Then, back on the VM, print the certificate's **subject** and its **issuer** — the same
    `openssl x509` command as step 25, with `-issuer` added.

    ```bash
    # print the certificate's subject and issuer
    <...>
    ```

    **Write down the warning your browser showed, and those two lines.**  **→ `T28`**

    ***Read the two lines you just printed, one above the other.*** *`subject` is who the
    certificate is about. `issuer` is who says so. A certificate you would pay for has two
    different names on those lines. The browser checks whether it trusts the second one — and
    the encryption itself is real either way.*

29. Now empty the **http** server. Replace the contents of the server block in
    `http-default.conf` — its logs, root, index, locations and the `include` all go — with one
    directive:

    ```nginx
    server {
        listen      80 default_server;
        server_name <your VM's two names>;

        return 308 https://$host$request_uri;
    }
    ```

    Check, apply, and try it:

    ```bash
    # ask this machine for the school page over plain http, headers only
    HTTP/1.1 308 Permanent Redirect
    Server: nginx/1.30.4
    Date: Wed, 02 Sep 2026 07:41:02 GMT
    Content-Type: text/html
    Content-Length: 171
    Connection: keep-alive
    Location: https://127.0.0.1/school/
    ```

    ***`Location` is the last line, not the second.*** *If you pipe this through `head -2` you
    will see the status and the server version and conclude it is not redirecting anywhere.
    The header you want is at the bottom.*


    ***That number is not decoration, and you are about to see why.*** *Do the following twice,
    once with `301` on that line and once with `308`, reloading nginx in between. Both times,
    send a **new student** to the register **through the redirect** — over plain `http`, so the
    redirect is followed — and then read the API's journal.*

    ```bash
    # spelled out, because here the flags ARE the experiment and not something to
    # work out: -L follows the redirect, without which nothing reaches the API at
    # all; -k accepts your own certificate on the far side of it; -d makes it a POST
    $ curl -skL -H 'Content-Type: application/json' \
        -d '{"studentId":"<11 digits>","firstName":"TEST","lastName":"ONE","major":"IT"}' \
        http://127.0.0.1/school/api/students
    <...>
    $ journalctl -u school-api -n 1
    <...>
    ```

    **What method did the API log each time?**  **→ `T29`**

    ***Add `-v` and you can watch it happen in one command.*** *curl prints a `>` line for
    every request it makes — the one you asked for, and the one it made after the redirect —
    so both are in front of you at once instead of being compared across two runs. Note that
    those lines carry the path **you** asked for; the journal carries the path that **arrived**,
    after the proxy replaced the prefix. That is step 24, from the other end.*

    ***`-L` is not optional and neither is `-k`.*** *Without `-L`, curl stops at the redirect
    and the API is never asked anything — the journal shows nothing at all and there is nothing
    to compare. Without `-k` it stops at the certificate instead, one step later, with the same
    empty result. Neither is a lesson about curl; they are how you get the request through to
    the far end where the experiment happens.*

    ***But do NOT add `-X POST`.*** *`-X` forces the method on every request curl makes,
    including the one it makes after a redirect — which hides the whole effect you are looking
    for. Let `-d` make it a `POST` and let curl decide what to do next.*

    ***A different student number each time.*** *One of the two runs really does create a
    student; sending the same number twice would fail for a reason that has nothing to do with
    what you are measuring.*

    ***Then put `308` back and reload.*** *The register takes `POST` and `DELETE`. A redirect
    that changes the method produces a bug that appears only for people submitting a form:
    every page still loads, and only the submissions vanish. It is the worst kind of bug there
    is, and you have just watched it happen.*

    ***And you now have what `/school` needed at step 22.*** *One exact-match location does it:*

    ```nginx
    location = /school { return 301 /school/; }
    ```

    *`=` means **this path and no other**, so `/schoolhouse` is left alone — and `301` here
    rather than `308` for exactly the reason you just measured. It is not part of today's work.
    It is the line to remember the first time a deployment of yours serves an application under
    a path.*

    ***Now the file's name is the whole truth.*** *`http-default.conf` is three lines that send
    people away, and `https-default.conf` is the machine. That is what the file was always
    for — you just could not see it while it was named after one of the two applications it
    served.*

30. That redirect did not catch everything. Ask this machine for the same page under three
    different names, over plain `http`, from **your own computer**:

    ```bash
    # your VM's own name
    HTTP/1.1 308 Permanent Redirect

    # the name your class 3 site claims -- curl -H 'Host: ...' sends it
    HTTP/1.1 200 OK

    # a name nothing on this machine claims at all, invent one
    HTTP/1.1 308 Permanent Redirect
    ```

    Now open the files in `/etc/nginx/conf.d/` and look at the `server_name` line in each.

    **For each of the three names, write down which FILE answered it.**  **→ `T30`**

    ```
    <your VM's name>       -> <...>
    class.int134           -> <...>
    <the invented name>    -> <...>
    ```

    ***Two of the three came from the same file.*** *Find the one that did not, and look at
    what its `server_name` says. Then look at which file carries the word `default_server`.
    The page you read in step 20 covers this too — the server section comes before the
    location one: <https://nginx.org/en/docs/http/request_processing.html>*

    ***`default_server` does not mean "everyone".*** *It means "when no name matches". That is
    a much smaller promise than it sounds, and the difference is a page this machine still
    hands out in clear text. Leave it there — it is class 3's site and class 3 still checks it —
    but know that it is there. On a real deployment, "we redirect everything to https" is a
    sentence somebody says while a `server_name` nobody remembered goes on answering on 80.*

31. Check the whole machine from **your own computer**: the noticeboard, the school page and
    the API behind it, over `https`, plus what `http` now answers.

    ```bash
    # the noticeboard over plain http -- headers only. Read to the LAST line:
    # Location is at the bottom, not the top
    HTTP/1.1 308 Permanent Redirect
    <...>
    Location: https://<your VM>.sit.kmutt.ac.th/

    # the noticeboard over https
    HTTP/1.1 200 OK

    # the school page over https
    HTTP/1.1 200 OK

    # and the API through the proxy, over https -- the health endpoint, which
    # names whose deployment answered
    {"ok":true,"student":"<your student number>","time":"..."}
    ```

---

### Finish

Run the checker, and read what it says:

```bash
$ int134 check lab05class
```

**Your marks cannot go down.** If you ran it after each part, everything you earned is already
recorded, and this run can only add to it.

---

### What is checked

| Part | The machine is asked |
| :--- | :--- |
| 1 | `/var/www/school` is a published copy at `755`/`644`, outside the source tree; `config.js` carries your student number and an address the register lives at; nginx serves the page |
| 3 | the API's origin rule is set — **or** the proxy from Part 4 has made it unnecessary |
| 4 | the register comes back **through nginx**; the proxy passes on `Host` and the three forwarded headers; the API listens on `127.0.0.1` only; from outside, the API answers through the proxy **and** its own port refuses |
| 5 | the page answers at `/school/`, and its own port refuses from outside |
| 6 | this machine has a certificate naming **this** machine; `https` serves the page from outside; port 80 redirects to it |

Note what is **not** in that list: nothing checks the rename in step 20 or the `include` in it.
The checker asks what the machine does, and both are ways of arranging a file. Do them anyway —
step 30 is about what the arrangement makes visible, and the lab exam is written the same way.

**Every check accepts the arrangement from its own part onwards.** The page is "served"
whether it is on your page port or at `/school/`; the API is "proxied" either way. Work later
in the afternoon never takes away what an earlier part earned — and neither does the sweep at
the end of class.

**Part 2 is not checked at all.** A browser refusing to hand a response to a page is invisible
to every tool the checker has — no `curl`, no log and no probe sees it, because it happens
inside the browser and after a reply that arrived perfectly well. `T4` to `T7` are the only
record that you watched it happen.

---

### Without the sheet

By the end of today, this is what you have built. If you can produce it on a bare machine from
this list alone, you understand the class — and this is how the lab exam will be written: an
outcome, a machine, and no list of commands.

- A second static site is published from its own document root, at the modes a published
  directory should have, with the source tree left where it is and never served.
- One nginx server answers for both applications, distinguishing them by path.
- Requests under a path are handed to an application that listens only where the web server
  can reach it, and that application is told the name, address and scheme the client used.
- The application is not reachable from the network by any route except that one.
- The firewall allows only the ports still in use, and nothing else.
- The machine presents a certificate that names it, with the private key readable only by root.
- Clear-text requests **to the names the default server answers for** are met with a permanent
  redirect to the encrypted door, of the kind that is safe for a form submission as well as a
  page view — and you can say which names those are, and which are not.
