/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 * Author           shani
 * Created          8 May, 2018
 */

CREATE TABLE inverters (
    id              varchar(100) primary key,
    name            varchar(100),
    brand           varchar(30),
    power           integer,
    phase           integer,
    systemtype      varchar(10),
    pvkwmax         integer,
    pvkwmin         integer,
    pvvlow          integer,
    pvvhigh         integer,
    pvvmax          integer,
    chargertype     varchar(20),
    batteryv        integer,
    loadkwmax       integer,
    surgekwmax      integer,
    warranty        integer,
    maxchargecurrent    integer,
    solarefficiency     integer,
    inverterefficieicy  integer,
    pvseries        integer,
    price           integer,
    maxdiscount     integer,
    tax             integer,
    combotax        integer,
    isstring        boolean
);

CREATE TABLE batteries (
    id            varchar(100) primary key,
    name          varchar(100),
    brand         varchar(100),
    warranty      integer,
    ah            integer,
    v             integer,
    price         integer,
    tax           integer,
    combotax      integer,
    maxdiscount   integer
);

CREATE TABLE panels (
    id              varchar(100) primary key,
    name            varchar(100),
    brand           varchar(20),
    power           integer,
    voc             float,
    vmax            float,
    isc             float,
    imax            float,
    cells           float,
    warranty        varchar(100),
    price           integer,
    tax             integer,
    maxdiscount     integer,
    minorder        integer,
    maxsysv         integer
);

CREATE OR REPLACE VIEW products AS
    SELECT 'panel'  as type, id ,name, brand , price, maxdiscount, tax, 
        '{ "power" : ' || power || ' , "voc" : ' || voc || ', "isc" : ' || isc ||
         ', "vmax" : ' || vmax  || ', "imax" : ' || imax || ', "warranty" : "' || warranty || '" } '  as props FROM panels
    UNION
    SELECT 'battery'  as type, id , name, brand , price, maxdiscount, tax, 
        '{ "ah" : ' || ah || ' , "v" : ' || v || ' } '  as props FROM batteries
    UNION
    SELECT 'inverter'  as type, id, name, brand , price, maxdiscount, tax, 
        '{ "power" : ' || power || ' , "phase" : ' || phase || ', "systemtype" : ' || systemtype ||
                ', "pvkwmax" : ' || pvkwmax || ' , "pvv" : [' || pvvlow || ',' || pvvhigh || '], "chargertype" : ' || chargertype ||
                ', "loadkwmax" : ' || loadkwmax || ' , "surgekwmax" : ' || surgekwmax || ', "solarefficiency" : ' || solarefficiency || 
                ', "inverterefficieicy" : ' || inverterefficieicy || ' , "pvseries" : ' || pvseries || ' } '  as props FROM inverters;

        