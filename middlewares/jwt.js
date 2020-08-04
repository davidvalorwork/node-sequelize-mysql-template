module.exports={
    protegerRutas:(app,express,jwt)=>{
        const rutasProtegidas = express.Router(); 
        rutasProtegidas.use((req, res, next) => {
            const token = req.headers['access-token'];
            if (token) {
                jwt.verify(token, app.get('llave'), (err, decoded) => {      
                    if (err) {
                        return res.json({ mensaje: 'Token inválida' });    
                    } else {
                    req.decoded = decoded;    
                    next();
                    }
                });
            } else {
                res.send({ 
                    mensaje: 'Token no proveída.' 
                });
            }
        });
        return rutasProtegidas;
    }
}    