from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/', methods=['GET'])
def home_page():
    try:
        data_set = [
        {
            "detOrdenList": [
                {
                    # Detalles de la orden (elementos específicos aquí)
                    # ...
                }
            ],
            "orden": {
                
                "caja" : {
                  
                  "comercioSucursal" : {
                      
                      "nombre": "Colonia escalon, lajas poniente"
                  } 
                },
                
                "comercio":{
                    
                    "nombre" :  "pupuseria christian",
                    
                    
                },
                
                "fechaOrden" : "2023-06-28T08:59:04.716-06:00"
                # Detalles de la orden (elementos específicos aquí)
                # ...
            }
        },
        {
            "detOrdenList": [
                {
                    # Detalles de la orden (elementos específicos aquí)
                    # ...
                }
            ],
            "orden": {
                # Detalles de la orden (elementos específicos aquí)
                # ...
            }
        }
    ]
        return jsonify(data_set)
    except Exception as e:
        error_message = {"error": str(e)}
        
        return jsonify(error_message), 500  # Código de estado 500 para indicar un error interno del servidor

@app.after_request
def add_headers(response):
    response.headers['Content-Type'] = 'application/json'
    return response

if __name__ == '__main__':
    app.run(port=7777)
