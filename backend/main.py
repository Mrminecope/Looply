from fastapi import FastAPI
app = FastAPI(title='Looply Backend')
@app.get('/')
def root():
    return {'message':'Looply backend running'}
