
//*************************** Select Customer **************************//
    
/**
 * Given the customer ID, it returns a JSON object of the branches visited
 *
 { 
    id: number,
    visitedBranch: { 
        branchId : { lat: number, lon: number}
    },
    mainBranch: number
    homeLoc: {lat: number, lon: number},
    workLoc: {lat: number, lon: number}
 }
 *
 */
var getCustomer = function (customerId, file) {
    var branches_visited = {};
    var customer_info = {};
    for (idx in file){
        cust = file[idx];
        if ((cust['CUSTOMER_ID']==customerId) && !(cust['BRANCH_ID'] in branches_visited)) {
            branches_visited[cust['BRANCH_ID']] = { 
                lat: cust['BRANCH_LAT'], 
                lon: cust['BRANCH_LON'] 
            };
        }
        if ((cust['CUSTOMER_ID']==customerId) && !('id' in customer_info)){
            customer_info = { 
                id: customerId,
                mainBranch: cust['MAIN_BRANCH_ID'],
                homeLoc: { lat: cust['HOME_LAT'], lon: cust['HOME_LON']},
                workLoc: { lat: cust['WORK_LAT'], lon: cust['WORK_LON']}
            };
        }
    }
    customer_info.visitedBranch = branches_visited;
    return customer_info;
}

/**
 * Given the customer info, add the markers to the map
 */
var visCustomer = function(custInfo, map, markerList){
    markerList.forEach(function (marker) {
        map.removeLayer(marker);
    });
    markerList.length = 0;
    for (idx in custInfo['visitedBranch']){
        info = custInfo['visitedBranch'][idx];
        var marker = new L.marker([info['lat'],info['lon']],{icon: branchIcon})
                .bindPopup(idx)
                .addTo(map);
        map.addLayer(marker);
        markerList.push(marker);
    }
    var marker = L.marker([custInfo['homeLoc']['lat'],custInfo['homeLoc']['lon']], {icon: homeIcon})
                .bindPopup("Home")
                .addTo(map);
    map.addLayer(marker);
    markerList.push(marker);

    var marker = L.marker([custInfo['workLoc']['lat'],custInfo['workLoc']['lon']], {icon: workIcon})
                .bindPopup("Work")
                .addTo(map);
    map.addLayer(marker);
    markerList.push(marker);
}

//*************************** Select Branch **************************//

/**
 * Given the branch ID returns 
    {
        id: number,
        loc: {lat: number, lon: number},
        visitedCustomers: {
            customerId: {homeLoc: {lat: number, lon: number}, workLoc: {lat: number, lon: number}}}
        }
    }
 */
var getBranch = function (branchId, file) {
    var visitedCustomers = {};
    var branch_info = {};
    for (idx in file){
	cust = file[idx];
        if ((cust['BRANCH_ID']==branchId) && !(cust['CUSTOMER_ID'] in visitedCustomers)) {
            visitedCustomers[cust['CUSTOMER_ID']] = {
                homeLoc: { lat: cust['HOME_LAT'], lon: cust['HOME_LON']},
                workLoc: { lat: cust['WORK_LAT'], lon: cust['WORK_LON']}
            };
        }
        if ((cust['BRANCH_ID']==branchId) && !('id' in branch_info)){
            branch_info = {
                id: branchId,
                loc: { lat: cust['BRANCH_LAT'], lon: cust['BRANCH_LON']}
            };
        }
    }
    branch_info.visitedCustomers = visitedCustomers;
    return branch_info;
}

/**
 * Given the branch info, 
 *it adds the markers to the map
 */
var visBranch = function(branchInfo, map, markerList){

    markerList.forEach(function (marker) {
        map.removeLayer(marker);
    });
    markerList.length = 0;
    listPoint=[];
    for (idx in branchInfo['visitedCustomers']){
        cust = branchInfo['visitedCustomers'][idx];
        //homePoint
        var homePoint=[cust['homeLoc']['lat'],cust['homeLoc']['lon']];
        var marker = new L.marker(homePoint,{icon: homeIcon})
                .bindPopup(idx)
                .addTo(map);
        map.addLayer(marker);
        markerList.push(marker);
        //workPoint
        var workPoint= [cust['workLoc']['lat'],cust['workLoc']['lon']]
        var marker = new L.marker(workPoint,{icon: workIcon})
                .bindPopup(idx)
                .addTo(map);
        map.addLayer(marker);
        markerList.push(marker);
        //branchPoint
        var branchPoint=[branchInfo['loc']['lat'],branchInfo['loc']['lon']];
           listPoint.push([branchPoint,workPoint,homePoint])
        }
        var marker = L.marker([branchInfo['loc']['lat'],branchInfo['loc']['lon']], {icon: branchIcon})
                .bindPopup(branchInfo['id'].toString())
                .addTo(map);
        map.addLayer(marker);
        markerList.push(marker);
};
 
//*************************** ProfileFeature: Customer **************************//

/**
 * given the customer id and the the data file 
 * returns an array  of the branch visit history 
 * in the form [[day,hour, number of visits],[],...] 
 * day(0-6) 0 being Sunday
 * hour (1-24)
 * and two objets {day:total number of visits} and {brach:total number of visits}
 * and the total visits of the customer
 */

var customerHsitory=function(customerId,file){
    var visitHistory = new Array(168+1).join('0').split('').map(parseFloat);
    for (var i = 0; i < visitHistory.length; i++) {
        visitHistory[i] = [0,0,0];
    }
    //working on the second column to count to 24 then start again
    var count =1;

    for (idx in visitHistory){
        array=visitHistory[idx];
        if (count==25){
            count =1;
        };
        array[1]=count;
        count+=1;    
    };

    var count =0;
    var othercount=1;
    //working on first column
    for (idx in visitHistory){
        array=visitHistory[idx];
        if (othercount==25){
            othercount=1;
            count+=1;
        };
        array[0]=count;
        othercount+=1;
    };

    for (idx in file){
        cust=file[idx];
            if ((cust['CUSTOMER_ID']==customerId)){
                var dateString = cust['BRANCH_VISIT_TIME'];
                var dateVisit= new Date( dateString.slice(2,5)+dateString.slice(0,2)+','+dateString.slice(5,9)+' '+dateString.slice(10));
                var dayVisit= dateVisit.getDay();//get the number of the day 0:sunday to 6:Saturday

                for (idx in visitHistory){
                     array=visitHistory[idx];
                     if (array[0]== dayVisit && array[1]==dateString.slice(10,12)){
                        array[2]+=1;
                     }
                 }
             }
         }

    // total visits per day     
    totalVisitsDay={};
    for (idx in visitHistory){
        array=visitHistory[idx];
        if ((array[0] in totalVisitsDay)){
            totalVisitsDay[array[0]]+=array[2];
        }
        if (!(array[0] in totalVisitsDay)){
            totalVisitsDay[array[0]]=array[2];
        }
    }

    //total visits for each branch
    totalVisitsBranch={}
    for (idx in file){
        cust=file[idx];
            if ((cust['CUSTOMER_ID']==customerId)){
                if (!(cust['BRANCH_ID'] in totalVisitsBranch)) {
                    totalVisitsBranch[cust['BRANCH_ID']]=0;
                }
                if ((cust['BRANCH_ID'] in totalVisitsBranch)) {
                    totalVisitsBranch[cust['BRANCH_ID']]+=1;
                }
            }
    }

    // total visitst by the customer
    var sum = 0;
    for( var el in totalVisitsBranch ) {
        if( totalVisitsBranch.hasOwnProperty( el ) ) {
            sum += parseFloat( totalVisitsBranch[el] );
        }
     }

    // total visits per hour     
    totalVisitsHour={};
    for (idx in visitHistory){
        array=visitHistory[idx];
        if ((array[1] in totalVisitsHour)){
            totalVisitsHour[array[1]]+=array[2];
        }
        if (!(array[1] in totalVisitsHour)){
            totalVisitsHour[array[1]]=array[2];
        }
    }
    finalCustomerHistory = [visitHistory,totalVisitsDay,totalVisitsBranch,sum,totalVisitsHour];
    return finalCustomerHistory;


};

//*************************** ProfileFeature: Branch **************************//

/**
 * given the branch id and the the data file 
 * returns an array  of the branch visit history 
 * in the form [[day,hour, number of visits],[],...] 
 * day(0-6) 0 being Sunday
 * hour (1-24)
 * and two objets {day:total number of visits} and {customer:total number of visits}
 * and the total visits to the branch
 */


var branchHsitory=function(branchId,file){
    var visitHistory = new Array(168+1).join('0').split('').map(parseFloat);
    for (var i = 0; i < visitHistory.length; i++) {
        visitHistory[i] = [0,0,0];

    }
    //working on the second column to count to 24 then start again
    var count =1;
    for (idx in visitHistory){
        array=visitHistory[idx];
        if (count==25){
            count =1;
        };
        array[1]=count;
        count+=1;    
    };

    var count =0;
    var othercount=1;
    //working on first column
    for (idx in visitHistory){
        array=visitHistory[idx];
        if (othercount==25){
            othercount=1;
            count+=1;
        };
        array[0]=count;
        othercount+=1;
    };

    //Number of visits in the third column
    for (idx in file){
        cust=file[idx];
            if ((cust['BRANCH_ID']==branchId)){
                var dateString = cust['BRANCH_VISIT_TIME'];
                var dateVisit= new Date( dateString.slice(2,5)+dateString.slice(0,2)+','+dateString.slice(5,9)+' '+dateString.slice(10));
                var dayVisit= dateVisit.getDay();//get the number of the day 0:sunday to 6:Saturday
                for (idx in visitHistory){
                     array=visitHistory[idx];

                     if (array[0]== dayVisit && array[1]==dateString.slice(10,12)){
                        array[2]+=1;
                     }

                 }
             }
         }


    // total visits per day     
    totalVisitsDay={};
    for (idx in visitHistory){
        array=visitHistory[idx];
        if ((array[0] in totalVisitsDay)){
            totalVisitsDay[array[0]]+=array[2];
        }
        if (!(array[0] in totalVisitsDay)){
            totalVisitsDay[array[0]]=array[2];
        }
    }

    //total visits for each customer
    totalVisitsCustomer={}
    for (idx in file){
        cust=file[idx];
            if ((cust['BRANCH_ID']==branchId)){
                if (!(cust['CUSTOMER_ID'] in totalVisitsCustomer)) {
                    totalVisitsCustomer[cust['CUSTOMER_ID']]=0;
                }
                if ((cust['CUSTOMER_ID'] in totalVisitsCustomer)) {
                    totalVisitsCustomer[cust['CUSTOMER_ID']]+=1;
                }
            }
    }

    //total number of visits to the branch
    var sum = 0;
    for( var el in totalVisitsCustomer ) {
        if( totalVisitsCustomer.hasOwnProperty( el ) ) {
            sum += parseFloat( totalVisitsCustomer[el] );
        }
     }

    // total visits per hour     
    totalVisitsHour={};
    for (idx in visitHistory){
        array=visitHistory[idx];
        if ((array[1] in totalVisitsHour)){
            totalVisitsHour[array[1]]+=array[2];
        }
        if (!(array[1] in totalVisitsHour)){
            totalVisitsHour[array[1]]=array[2];
        }
    }
    finalBranchHistory = [visitHistory,totalVisitsDay,totalVisitsCustomer,sum,totalVisitsHour];
    return finalBranchHistory;
};
