echo "Start buiding the application..."
ng build --prod --base-href "https://aajajim.github.io/identityVerifier/"
echo "Application builing finished!"

echo "Deploy to github pages"
ngh -S --message="Deploy with ngh"
