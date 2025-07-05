from flask import Flask, request, jsonify
from flask_cors import CORS
import util

app = Flask(__name__)
CORS(app)

@app.route('/classify_image',methods = ['GET','POST'])

def classify_image():
    try:
        result = request.get_json()
        image_data = result['image']

        prediction_result = util.classify_image(image_data)
        predicted_name = prediction_result[0]['class']
        confidence = f"{max(prediction_result[0]['class_probability']):.2f}%"

        player_info = {
            "messi": {
            "name": "Lionel Messi",
            "info": "Argentine professional footballer who plays as a forward and captains both Inter Miami and the Argentina national team."
        },
        "neymar": {
            "name": "Neymar Jr.",
            "info": "Brazilian footballer known for his dribbling, finishing, and skill. He has played for Barcelona and PSG."
        },
        "cristiano_ronaldo": {
            "name": "Cristiano Ronaldo",
            "info": "Portuguese legend, all-time top scorer for Real Madrid and currently playing for Al-Nassr FC in Saudi Arabia."
        },
        "luka_modric": {
            "name": "Luka Modrić",
            "info": "Croatian midfield maestro known for his vision, passing, and leadership. Ballon d'Or winner in 2018."
        },
        "eden_hazard": {
            "name": "Eden Hazard",
            "info": "Belgian winger known for his pace and creativity. Former Chelsea and Real Madrid player."
        }
        }

        extra = player_info.get(predicted_name.lower(), {
            "name": predicted_name,
            "info": "No additional information available."
        })

        return jsonify({
            "success": True,
            "primary_class": extra["name"],
            "confidence": confidence,
            "description": extra["info"]
        })

    except Exception as e:
        print("❌ Exception during classification:", e)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 200

if __name__ == "__main__":
    print("Loading.........")
    util.load_saved_artifacts()
    app.run(port=5000)