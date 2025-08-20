import app from './api/app.mjs';

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server on ${port}`);
});
