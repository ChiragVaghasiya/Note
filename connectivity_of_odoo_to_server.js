var xmlrpc = require("xmlrpc");
var Odoo = require("odoo-xmlrpc");
const fs = require("fs");

module.exports = {
  async afterCreate(event) {
    const { result } = event;

    setTimeout(async () => {
      const entries = await strapi.entityService.findOne(
        "api::candidate-form.candidate-form",
        result?.id,
        {
          populate: ["file_upload"], 
        }
      );

      const imagePath = `public/${entries?.file_upload?.url}`;
      var str_image;

      fs.readFile(imagePath, (error, data) => {
        if (error) {
          console.error("Error reading the image file:", error);
          return;
        }
        // Encode the image data to Base64
        const base64Image = Buffer.from(data).toString("base64");
        // Output the Base64-encoded image
        // console.log(base64Image);
        str_image = base64Image;
      });

      
      var odoo = new Odoo({
        url: "https://hrms.aspiresoftserv.com",
        port: 443,
        db: "HRMS",
        username: "apiuser@aspiresoftserv.com",
        password: "d6303401225d8a7d3fef149bee3cec068ffd2ee8",
      });

      odoo.connect(function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("Connected to Odoo server.");
        var inParams = [];
        var cityValue;
        var city;
        inParams.push([["location_name", "=", result?.current_location]]);
        var params = [];
        params.push(inParams);
        odoo.execute_kw(
          "current.location.city",
          "search",
          params,
          function (err, value) {
            // console.log(err, ":::err", value, ":::value");
            cityValue = value;
            if (err) throw err;
            if (value?.length === 0) {
              var inParams = [];
              inParams.push({ location_name: result?.current_location });
              var param2 = [];
              param2.push(inParams);
              odoo.execute_kw(
                "current.location.city",
                "create",
                param2,
                function (err, createCity) {
                  if (err) throw err;
                  city = createCity;
                  // console.log(createCity, "::::::created city");
                }
              );
            }
          }
        );
        // console.log(params, "::PARAMS");
        inParams = [];
        inParams.push({
          name: result?.name,
          email: result?.email,
          mobile: result?.mobile,
          linked_in_profile: result?.linkedin,
          total_exp: result?.total_exp_years,
          salary_expected: result?.salary_expected,
          salary_current: result?.salary_current,
          total_exp_years: result?.exp_in_month,
          notice_period: result?.notice_period,
          // 'current_location_city': cityValue[0]
        });
        params = [];
        params.push(inParams);
        odoo.execute_kw(
          "candidate",
          "create",
          params,
          function (err, createdCandidate) {
            if (err) throw err;
            // console.log('Created candidate:', createdCandidate);
            // Create an attachment for the candidate
            inParams = [];
            inParams.push({
              name: result?.name,
              type: "binary",
              datas: str_image,
              res_model: "candidate",
              res_id: createdCandidate,
            });
            params = [];
            params.push(inParams);
            odoo.execute_kw(
              "ir.attachment",
              "create",
              params,
              function (err, createdAttachment) {
                if (err) {
                  throw err;
                }
                // console.log('Created attachment:', createdAttachment);
              }
            );
          }
        );
      });
    }, 5000);

    //   // Add a condition to check if the `file_upload` field exists and fetch its value if it does
    //   if (entries && entries.file_upload) {
    //     const fileUpload = entries.file_upload;
    //     // Process the `fileUpload` here as needed
    //   }

    // Continue with the rest of your code
    // ...

    // console.log(entries, ":::entries")
    // console.log(result, "::::::result test");

    // Read the image file

    // var host = '192.168.2.97';
    // var port = 8666;
    // var db = 'testInvoice1';
    // var username = 'admin';
    // var password = 'admin';
    // var client = xmlrpc.createClient({ host, port, path: '/xmlrpc/2/common' });
    // client.methodCall('authenticate', [db, username, password, {}], (error, uid) => {
    //     console.log(uid, ":::uid");
    //     if (error) throw error;
    //     var models = xmlrpc.createClient({ host, port, path: '/xmlrpc/2/object' })
    //     models.methodCall('execute_kw', [db, uid, password, 'current.location.city', 'search', [[['location_name', '=', entries?.current_location]]]], (error, city) => {
    //         console.log(city, "::::city");
    //         if (error) throw error;
    //         else if (city?.length === 0) {
    //             var models = xmlrpc.createClient({ host, port, path: '/xmlrpc/2/object' })
    //             models.methodCall('execute_kw', [db, uid, password, 'current.location.city', 'create', [{ 'location_name': entries?.current_location }]], (error, new_city) => {
    //                 if (error) throw error;
    //                 console.log(new_city, ":::object");
    //                 location = new_city
    //                 console.log(location, ":::::top loaction");
    //                 var models = xmlrpc.createClient({ host, port, path: '/xmlrpc/2/object' })
    //                 models.methodCall('execute_kw', [db, uid, password, 'candidate', 'create', [
    //                     {
    //                         'name': entries?.name,
    //                         'email': entries?.email,
    //                         'mobile': entries?.mobile,
    //                         'linked_in_profile': entries?.linkedin,
    //                         'total_exp': entries?.total_exp_years,
    //                         'salary_expected': entries?.salary_expected,
    //                         'salary_current': entries?.salary_current,
    //                         'total_exp_years': entries?.exp_in_month,
    //                         'notice_period': entries?.notice_period,
    //                         'current_location_city': location
    //                     }]], (error, createdCandidate) => {
    //                         if (error) throw error;
    //                         // entry(result);
    //                         console.log(createdCandidate, "========== Canidate");
    //                         models.methodCall('execute_kw', [db, uid, password, 'ir.attachment', 'create', [
    //                             {
    //                                 'name': entries?.name,
    //                                 'type': 'binary',
    //                                 'datas': str_image,
    //                                 'res_model': 'candidate',
    //                                 'res_id': createdCandidate
    //                             }]], (error, test) => {
    //                                 console.log(test, "============= attachment");
    //                                 if (error) throw error;
    //                             })

    //                     })
    //             })
    //         } else {
    //             location = city[0]
    //             console.log(location, ":::::BOTTOM loaction");
    //             var models = xmlrpc.createClient({ host, port, path: '/xmlrpc/2/object' })
    //             models.methodCall('execute_kw', [db, uid, password, 'candidate', 'create', [
    //                 {
    //                     'name': entries?.name,
    //                     'email': entries?.email,
    //                     'mobile': entries?.mobile,
    //                     'linked_in_profile': entries?.linkedin,
    //                     'total_exp': entries?.total_exp_years,
    //                     'salary_expected': entries?.salary_expected,
    //                     'salary_current': entries?.salary_current,
    //                     'total_exp_years': entries?.exp_in_month,
    //                     'notice_period': entries?.notice_period,
    //                     'current_location_city': location
    //                 }]], (error, createdCandidate) => {
    //                     if (error) throw error;
    //                     // entry(result);
    //                     console.log(createdCandidate, "========== Canidate");
    //                     models.methodCall('execute_kw', [db, uid, password, 'ir.attachment', 'create', [
    //                         {
    //                             'name': entries?.name,
    //                             'type': 'binary',
    //                             'datas': str_image,
    //                             'res_model': 'candidate',
    //                             'res_id': createdCandidate
    //                         }]], (error, test) => {
    //                             console.log(test, "============= attachment");
    //                             if (error) throw error;
    //                         })

    //                 })
    //         }
    //     })
    //     // console.log(location,"::::location");
    // })

    // var odoo = new Odoo({
    //     url: 'https://hrms.aspiresoftserv.com',
    //     port: 443,
    //     db: 'HRMS',
    //     username: 'apiuser@aspiresoftserv.com',
    //     password: 'd6303401225d8a7d3fef149bee3cec068ffd2ee8'
    // });
    // odoo.connect(function (err) {
    //     if (err) {
    //         return console.log(err);
    //     }
    //     console.log('Connected to Odoo server.');
    //     var inParams = [];
    //     inParams.push([['active', '=', true], ['state', '=', 'recruit']]);
    //     var params = [];
    //     params.push(inParams);
    //     odoo.execute_kw('job.opening', 'search', params, function (err, value) {
    //         if (err) { return console.log(err); }
    //         console.log('Result: ', value);
    //         var inParams = [];
    //         inParams.push(value);
    //         inParams.push(['id', 'name', 'description', 'minimum_exp', 'maximum_exp', 'wfh', 'no_of_recruitment', 'essential_requirements', 'desired_skills', 'image', 'department_id']);
    //         var params = [];
    //         params.push(inParams);
    //         odoo.execute_kw('job.opening', 'read', params, function (err, result) {
    //             if (err) {
    //                 return console.log(err);
    //             }
    //             // console.log('Result: ', result);
    //             // downloadImage(result)
    //             entry(result)

    //         });
    //     });
    // });

    // const client = xmlrpc.createClient({
    //     host: 'https://hrms.aspiresoftserv.com',
    //     port: 443,
    //     path: '/xmlrpc/2/object' // Path may vary depending on your Odoo configuration
    //   });

    //   const credentials = {
    //     db: 'HRMS',
    //     username: 'apiuser@aspiresoftserv.com',
    //     password: 'd6303401225d8a7d3fef149bee3cec068ffd2ee8'
    //   };

    //   const candidateData = {
    //     name: 'Aditya Candidate',
    //     email: 'aditya@gmail.com',
    //     mobile: '9662284355'
    //   };

    //   client.methodCall('execute_kw', [credentials.db, credentials.username, credentials.password, 'candidate', 'create', [candidateData]], (error, value) => {
    //     if (error) {
    //       console.error('An error occurred:', error);
    //     } else {
    //       console.log('Candidate created successfully:', value);
    //     }
    //   });

    // var odoo = new Odoo({
    //     url: 'https://hrms.aspiresoftserv.com',
    //     port: 443,
    //     db: 'HRMS',
    //     username: 'apiuser@aspiresoftserv.com',
    //     password: 'd6303401225d8a7d3fef149bee3cec068ffd2ee8'
    // });
    // odoo.execute_kw('res.users', 'authenticate', [[], 'apiuser@aspiresoftserv.com', 'd6303401225d8a7d3fef149bee3cec068ffd2ee8'], function (err, value) {
    //     if (err) {
    //       console.log('Error authenticating:', err);
    //       return;
    //     }

    //     console.log('Authenticated. User ID:', value);
    //     odoo.disconnect();
    //   });
    // });
    // const candidateData = {
    //     name: 'Aditya Candidate',
    //     email: 'aditya@gmail.com',
    //     mobile: '9662284355'
    //   };

    //   odoo.execute_kw('candidate', 'create', [candidateData], function (err, createdCandidate) {
    //     if (err) {
    //         console.log('Created candidate:', createdCandidate,":::::errr", err);
    //     //   throw err;
    //     }

    //     // Create an attachment for the candidate
    //     const attachmentData = {
    //       name: 'Aditya Candidate',
    //       type: 'binary',
    //       datas: str_image,
    //       res_model: 'candidate',
    //       res_id: createdCandidate
    //     };

    //     odoo.execute_kw('ir.attachment', 'create', [attachmentData], function (err, createdAttachment) {
    //       if (err) {
    //         throw err;
    //       }
    //       console.log('Created attachment:', createdAttachment);
    //     });
    //   });

    // var client = xmlrpc.createClient({ host, port: 443, path: '/xmlrpc/2/common' });
    // client.methodCall('authenticate', [db, username, password, {}], (error, uid) => {
    //     if (error) throw error;
    //     console.log('Connected to Odoo server.');
    //     var models = xmlrpc.createClient({ host, port, path: '/xmlrpc/2/object' })
    //     // models.methodCall('execute_kw', [db, uid, password, 'candidate', 'search', [[]]], (error, result) => {
    //     //     console.log("Data Result", result);
    //     //     if (error) throw error;
    //     //     var result = [];
    //     models.methodCall('execute_kw', [db, uid, password, 'candidate', 'create', [{ 'name': 'Gautam', 'email': 'gautam@gmail.com', 'mobile': '9662284355' }]], (error, createdCandidate) => {
    //         if (error) throw error;
    //         // entry(result);
    //         console.log(createdCandidate,"========== Canidate");
    //         models.methodCall('execute_kw', [db, uid, password, 'ir.attachment', 'create', [
    //           {
    //             'name':'Gautam'+ 'Candidate',
    //             'type': 'binary',
    //             'datas':str_image,
    //             'res_model': 'candidate',
    //             'res_id': createdCandidate
    //           }]],(error, test) => {
    //           console.log(test,"============= attachment");
    //           if (error) throw error;
    //         })

    //     })
    //     // })
    // })

    // var odoo = new Odoo({
    //     url: 'https://hrms.aspiresoftserv.com',
    //     port: 443,
    //     db: 'HRMS',
    //     username: 'apiuser@aspiresoftserv.com',
    //     password: 'd6303401225d8a7d3fef149bee3cec068ffd2ee8'
    //   });
    //   odoo.connect(function (err) {
    //     if (err) {
    //       return console.log(err);
    //     } console.log('Connected to Odoo server.');
    //   });
    //     var client = xmlrpc.createClient({ host, port, path: '/xmlrpc/2/common' });
    // client.methodCall('authenticate', [db, username, password, {}], (error, uid) => {
    //     if (error) throw error;
    //     var models = xmlrpc.createClient({ host, port, path: '/xmlrpc/2/object' })
    //     models.methodCall('execute_kw', [db, uid, password, 'candidate', 'search', [[]]], (error, result) => {
    //         console.log("Data Result", result);
    //         if (error) throw error;
    //         var result = [];
    //         entries?.map(data=>result.push({ 'name': data.name, 'email': data.email, 'mobile': data.mobile, 'total_exp_years': Math.floor(data.total_exp_years), 'salary_current': Math.floor(data.salary_current), 'salary_expected': Math.floor(data.salary_expected) }))
    //         models.methodCall('execute_kw', [db, uid, password, 'candidate', 'create', [result]], (error, result) => {
    //             if (error) throw error;
    //             // console.log(result);
    //         })
    //     })
    // })

    // console.log(entries,"entries")

    // const entry = (result) => {

    //   result.map(async (data) => {
    //     if (data.id == entries.cand_id) return
    //     else {
    //       try {
    //         await strapi.entityService.create('api::opening-list.opening-list', {
    //           data: {
    //             cand_id: data.id,
    //             name: data.name,
    //             description: data.description,
    //             minimum_exp: data.minimum_exp,
    //             maximum_exp: data.maximum_exp,
    //             work_from_home: data.wfh,
    //             no_of_recruitment: data.no_of_recruitment
    //           }
    //         });
    //       } catch (e) {
    //       }
    //     }
    //   })

    // }
  },
};
