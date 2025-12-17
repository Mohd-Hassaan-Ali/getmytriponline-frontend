@echo off
echo Setting up Git repository...

git init
git branch -M main
git remote add origin https://github.com/Mohd-Hassaan-Ali/getmytriponline-frontend.git
git add .
git commit -m "Initial frontend upload"
git push -u origin main

echo Done!
pause
