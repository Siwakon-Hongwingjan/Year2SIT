#!/usr/bin/env bash
trap 'echo "caught it — not going anywhere"' TERM
while true; do
  sleep 1
done
