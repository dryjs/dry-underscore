
function library(_){
    
    var lib = {};

    lib.ca = function(bundle_path){
        var ca = [];

        try{ var chain = fs.readFileSync(bundle_path, 'utf8'); }
        catch(e){ 
            _.stderr("Not using a certificate chain. Can't read ca bundle file: " + bundle_path + ".");
            return([]);
        }

        chain = chain.split("\n");

        var cert = [];

        _.each(chain, function(line){
            if(line.length === 0){ return; }
            cert.push(line);
            if(line.match(/-END CERTIFICATE-/)){
                ca.push(cert.join("\n"));
                cert = [];
            }
        });

        return(ca);
    };

    lib.hash = function(key_path, cert_path, bundle_path){
        return({
            key : fs.readFileSync(key_path, 'utf8'),
            cert : fs.readFileSync(cert_path, 'utf8'),
            ca : lib.ca(bundle_path)
        });
    };

    lib.library = library;
    return(lib);
}

exports.library = library;

