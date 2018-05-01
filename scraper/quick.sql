// Current Bills, imp fields
select accountid, amttobepaid, conscity, billmon, billyear, customername, consaddr from billsjan18;

// City List
select distinct conscity from billsjan18 ;

// Avg, max, count of current bills for each city
select avg(amttobepaid), max(amttobepaid), count(accountid), conscity from billsjan18 group by conscity order by count;

// imp fields for city
select accountid, amttobepaid, conscity, billmon, billyear, customername, consaddr from billsjan18 where conscity = 'REWA' order by amttobepaid desc;

// No. of Customers above certain bill amt
select count(*) from billsjan18 where amttobepaid > 30000 ;

// List of customers above certain bill amt
select accountid, amttobepaid, conscity, billmon, billyear, customername, consaddr from billsjan18 where amttobepaid > 100000 order by amttobepaid desc;

// Last id downloaded for a series
select max(id) from rawcust where id % 100000 = 21000;

// No. of customers for a series
select count(*) from rawcust where id % 100000 = 23000;

// No. of customers by series
select count(*) count, id%100000 series from rawcust s group by series order by count desc;
